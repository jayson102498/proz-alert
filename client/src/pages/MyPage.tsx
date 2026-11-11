import { useState } from "react";
import TopHeader from "../components/TopHeader";
import Button from "@mui/material/Button";
import { Modal, ModalBody } from "reactstrap";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import DetailCard from "../components/DetailCard";
import axios from "axios";
import { PLAN, PLAN_OPTIONS, buttonStyle, smButtonStyle } from "../Constants";
import { convertDateTimetoLocalDate, convertTimestampToJapanDate } from "../utils/convert";
import { useAuth } from "../context/AuthContext";
import { logout } from "../utils/logout";
import CheckoutFromWrapper from "../components/CheckoutFormWrapper";
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";

const MyPage = () => {
	const { guser, setGUser } = useAuth();
	const [nameEdit, setNameEdit] = useState(false);
	const [emailEdit, setEmailEdit] = useState(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [cardModal, setCardModal] = useState<boolean>(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [plan, setPlan] = useState<number>(1);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const toggle = () => setIsOpen((prev) => !prev);
	const toggleCardModal = () => setCardModal((prev) => !prev);
	const toggleDeleteModal = () => setDeleteModal((prev) => !prev);
	const handleDelete = () => {
		setIsSubmitting(true);
		axios
			.post("/api/cancalSubscription", {
				id: guser.id,
				subscription: guser.subscription,
				now: false,
			})
			.then((res) => {
				if (res.data.deleted) {
					logout();
					return;
				}
				const date = convertTimestampToJapanDate(res.data.canceled);
				toast.success(`サブスクリプションが解約されました。${date}までシステムをご利用いただけます。`);

				setGUser({
					...guser,
					status: res.data.status,
					cancelRequest: res.data.cancelRequest,
					canceled: res.data.canceled,
				});
				toggleDeleteModal();
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	};

	const handleChangePassword = () => {
		axios
			.post("/api/getResetToken", { email: guser.email })
			.then((res) => {
				toast.success("リンクが作成されました。メールをご確認ください。");
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	};

	const handleNameEdit = () => {
		if (nameEdit) {
			axios
				.put("/api/updateUser", guser)
				.then((res) => {
					const data = res.data.user;
					setGUser({
						...guser,
						name: data.name,
					});
					setNameEdit((prev) => !prev);
				})
				.catch((error) => {
					toast.error(error.response?.data?.message ?? "エラー");
					console.log(error);
				});
		} else {
			setNameEdit((prev) => !prev);
		}
	};

	const handleEmailEdit = () => {
		if (emailEdit) {
			axios
				.put("/api/updateUser", guser)
				.then((res) => {
					const data = res.data.user;
					setGUser({
						...guser,
						email: data.email,
					});
					setEmailEdit((prev) => !prev);
				})
				.catch((error) => {
					toast.error(error.response?.data?.message ?? "エラー");
					console.log(error);
				});
		} else {
			setEmailEdit((prev) => !prev);
		}
	};

	const handlePlanChange = () => {
		if (guser.cancelRequest) {
			toast.error("解約中はプランの更新はできません。");
			return;
		}
		if (guser.plan === plan) {
			toast.error("変更するプランを選択してください。 現在のプランを選択しています。");
			return;
		}
		axios
			.post("/api/updateSubscription", {
				id: guser.id,
				subscription: guser.subscription,
				plan: plan,
				priceId: PLAN[plan - 1].priceId,
			})
			.then((res) => {
				setGUser({
					...guser,
					plan: plan,
				});
				toggle();
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	};

	return (
		<div>
			<TopHeader title='マイページ' />
			<div className='my-container'>
				<div className='d-flex align-items-center m-1'>
					<div className='font20 font-bold w-250'>お名前</div>
					<input
						value={guser?.name ?? ""}
						className={`me-5 font20 w-400 ${nameEdit ? "" : "no-border-text"}`}
						disabled={!nameEdit}
						onChange={(e) =>
							setGUser({
								...guser,
								name: e.target.value,
							})
						}
					></input>
					<Button
						variant={nameEdit ? "contained" : "outlined"}
						color='primary'
						sx={nameEdit ? smButtonStyle : {}}
						onClick={() => handleNameEdit()}
						className={nameEdit ? "" : "squre-button"}
					>
						{nameEdit ? "保存する" : <i className='fa fa-pencil font24'></i>}
					</Button>
				</div>

				<div className='d-flex align-items-center m-1'>
					<div className='font20 font-bold w-250'>メールアドレス</div>
					<input
						value={guser?.email ?? ""}
						className={`me-5 font20 w-400 ${emailEdit ? "" : "no-border-text"}`}
						disabled={!emailEdit}
						onChange={(e) =>
							setGUser({
								...guser,
								email: e.target.value,
							})
						}
					></input>
					<Button
						variant={emailEdit ? "contained" : "outlined"}
						color='primary'
						onClick={() => handleEmailEdit()}
						sx={emailEdit ? smButtonStyle : {}}
						className={emailEdit ? "" : "squre-button"}
					>
						{emailEdit ? "保存する" : <i className='fa fa-pencil font24'></i>}
					</Button>
				</div>

				<div className='d-flex align-items-center m-1'>
					<div className='font20 font-bold w-250'>ご契約プラン</div>
					<input
						value={guser?.plan ? PLAN_OPTIONS[guser.plan].label : ""}
						className='me-5 no-border-text font20 w-400'
						disabled
					></input>
					<Button variant='outlined' color='primary' onClick={toggle} className='squre-button'>
						<i className='fa fa-pencil font24'></i>
					</Button>
				</div>

				<div className='d-flex align-items-center m-1'>
					<div className='font20 font-bold w-250'>{guser.status === "canceled" ? "解約されたカード" : "お⽀払い⽅法"}</div>
					<input value={guser?.card ?? "未登録"} className='me-5 no-border-text font20 w-400' disabled></input>
					<Button
						variant={!guser.subscription ? "contained" : "outlined"}
						color='primary'
						onClick={() => toggleCardModal()}
						sx={!guser.subscription ? smButtonStyle : {}}
						className={!guser.subscription ? "" : "squre-button"}
					>
						{!guser.subscription ? "登録する" : <i className='fa fa-pencil font24'></i>}
					</Button>
				</div>
				<div className='d-flex align-items-center m-1 mt-3'>
					<div className='font20 font-bold w-250'>当⽉の通知回数</div>
					<input value={guser?.usage + "/100"} className='me-5 no-border-text font20 w-400' disabled></input>
				</div>
				<div className='d-flex align-items-center m-1 mt-3'>
					<div className='font20 font-bold w-250'>ご利⽤開始</div>
					<input
						value={convertDateTimetoLocalDate(guser?.createdDt ?? "")}
						className='me-5 no-border-text font20 w-400'
						disabled
					></input>
				</div>
				<div className='d-flex align-items-center m-1 mt-3'>
					<div className='font20 font-bold w-250'>転送先メールアドレス</div>
					<input value={guser?.pmail ?? ""} className='me-5 no-border-text font20 w-400' disabled></input>
				</div>

				<div className='my-5'>
					<Button variant='contained' color='primary' sx={buttonStyle} onClick={() => logout()}>
						<span className='font-bold'>ログアウト</span>
					</Button>
					<Button color='primary' className='mx-5' onClick={() => handleChangePassword()}>
						<span className='font-bold font18'>パスワード再設定</span>
					</Button>
				</div>

				<div className='text-center my-5'>
					{(() => {
						switch (guser.status) {
							case "active":
							case "past_due":
								return (
									<Button variant='contained' sx={buttonStyle} color='error' size='large' onClick={toggleDeleteModal}>
										<span className='font-bold px-5'>解約する</span>
									</Button>
								);
							case "canceled":
								return <div className='color-error font20 font-bold'>サブスクリプションが解約されました。</div>;
							case "canceling":
								return (
									<div className='color-error font20 font-bold'>
										サブスクリプションは{guser.canceled ? convertTimestampToJapanDate(guser.canceled) : "末日"}
										に解約されます。
									</div>
								);
							default:
								return null;
						}
					})()}
				</div>
			</div>
			<Modal isOpen={isOpen} toggle={toggle} centered size='lg' style={{ width: "600px" }}>
				<ModalBody>
					<div className='mb-2 d-flex justify-content-between'>
						<div className='font-bold font16'>プラン変更</div>
					</div>
					<FormControl className='m-2' style={{ width: "100%" }}>
						<RadioGroup
							aria-labelledby='demo-radio-buttons-group-label'
							value={plan}
							defaultValue='female'
							name='radio-buttons-group'
						>
							<div className='d-flex align-items-start' onClick={() => setPlan(1)}>
								<FormControlLabel value={1} control={<Radio />} label='' />
								<DetailCard num={1} plan={plan} />
							</div>
							<div className='d-flex align-items-start' onClick={() => setPlan(2)}>
								<FormControlLabel value={2} control={<Radio />} label='' />
								<DetailCard num={2} plan={plan} />
							</div>
							<div className='d-flex align-items-start' onClick={() => setPlan(3)}>
								<FormControlLabel value={3} control={<Radio />} label='' />
								<DetailCard num={3} plan={plan} />
							</div>
						</RadioGroup>
					</FormControl>
					<div className='font16'>プランを変更すると、機能は即時で変更されますが、⽉額料⾦は翌⽉ご利⽤分から変更となります。</div>
					<div className='text-center mt-5 mb-4'>
						<Button
							variant='outlined'
							sx={{ ...buttonStyle, color: "#777777" }}
							color='secondary'
							onClick={toggle}
							className='cancel-btn'
						>
							<span className='font-bold'>キャンセル</span>
						</Button>
						<Button
							variant='contained'
							sx={buttonStyle}
							color='primary'
							className='submit-btn'
							onClick={() => handlePlanChange()}
						>
							<span className='font-bold'>変更する</span>
						</Button>
					</div>
				</ModalBody>
			</Modal>
			<Modal isOpen={deleteModal} toggle={toggleDeleteModal} centered size='lg'>
				<ModalBody>
					<div className='m-2 d-flex justify-content-between'>
						<div className='font-bold font16'>ご利⽤のプランを解約します</div>
					</div>
					<div className='m-2'>
						毎⽉10⽇までに解約⼿続きをした場合、当⽉末での解約となります。
						<br></br>
						11⽇以降に解約を⼿続きをした場合は、翌⽉末での解約となります。
						<br></br>
						超過料⾦がある場合は、最終ご利⽤⽉の翌⽉5⽇に超過料⾦分のみをご登録のクレジットカードにご請求いたします。
						<br></br>
						解約完了後は設定情報等は全て削除され、復元はできません。
					</div>
					<div className='mt-4 text-end'>
						<Button variant='outlined' color='secondary' onClick={toggleDeleteModal} className='cancel-btn'>
							<span className='font-bold'>キャンセル</span>
						</Button>
						<LoadingButton
							type='submit'
							variant='contained'
							color='error'
							className='submit-btn'
							onClick={() => handleDelete()}
							loading={isSubmitting}
							loadingPosition='end'
							disabled={isSubmitting}
						>
							<span className='font-bold color-white'>解約する</span>
						</LoadingButton>
					</div>
				</ModalBody>
			</Modal>
			<Modal isOpen={cardModal} toggle={toggleCardModal} centered>
				<ModalBody>
					<CheckoutFromWrapper toggleCardModal={toggleCardModal} />
				</ModalBody>
			</Modal>
		</div>
	);
};

export default MyPage;
