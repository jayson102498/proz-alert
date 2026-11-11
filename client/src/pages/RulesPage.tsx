import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import TopHeader from "../components/TopHeader";
import Button from "@mui/material/Button";
import { Modal, ModalBody } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
	AVAILABLE_STATUS,
	DEFAULT_CONDITION_ITEM,
	DEFAULT_RULE,
	ERROR_MESSAGE,
	NOTIF_OPTIONS,
	PLAN,
	buttonStyle,
	smButtonStyle,
} from "../Constants";
import { ConditionItem, Rule, TimeItem } from "../Interface";
import ConditionBox from "../components/ConditionBox";
import SwitchDateBox from "../components/SwitchDateBox";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Overlay from "../components/Overlay";
import { toast } from "react-toastify";

const ruleSchema = Yup.object().shape({
	name: Yup.string().required("必須項目を入力してください"),
	phone: Yup.string().matches(/^[0-9+-]+$/, "有効な電話番号を入力してください"),
	notif: Yup.number().min(1, "必須項目を入力してください").required("必須項目を入力してください"),
});

function RulesPage() {
	const navigate = useNavigate();
	const { guser, loading } = useAuth();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [rules, setRules] = useState<Rule[]>([]);
	const [rule, setRule] = useState<Rule | null>(null);
	const [isEditMode, setIsEditMode] = useState<string | null>(null);
	const [deleteModal, setDeleteModal] = useState(false);
	const [subModal, setSubModal] = useState(false);
	const [errorCondMessage, setErrorCondMessage] = useState<string>("");
	const [errorTimeMessage, setErrorTimeMessage] = useState<string>("");
	const [errorPhoneMessage, setErrorPhoneMessage] = useState<string>("");

	const toggle = () => setIsOpen((prev) => !prev);
	const toggleDeleteModal = () => setDeleteModal((prev) => !prev);
	const toggleSubModal = () => setSubModal((prev) => !prev);

	const getRules = useCallback(() => {
		if (guser && !loading) {
			axios
				.get("/api/getRules/" + guser.id)
				.then((res) => {
					const updatedRules = res.data.rules.map((item: any) => ({
						id: item._id,
						name: item.name,
						notif: item.notif,
						phones: item.phones,
						conditions: item.conditions,
						setting: item.setting,
					}));
					setRules(updatedRules);
				})
				.catch((error) => {
					toast.error(error.response?.data?.message ?? "エラー");
					console.log(error);
				});
		}
	}, [guser, loading]);

	useEffect(() => {
		setRule({
			name: "",
			phones: [],
			notif: 1,
			conditions: [DEFAULT_CONDITION_ITEM],
			setting: [],
		});
		getRules();
		if (!loading && !AVAILABLE_STATUS.includes(guser.status ?? "")) {
			toggleSubModal();
		}
		// eslint-disable-next-line
	}, [getRules]);

	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "氏名",
			sortable: false,
			resizable: false,
			flex: 1,
		},
		{
			field: "actions",
			headerName: "",
			sortable: false,
			resizable: false,
			width: 120,
			align: "center",
			renderCell: (params: GridRenderCellParams) => {
				const handleCopyClick = () => {
					if (!AVAILABLE_STATUS.includes(guser.status ?? "")) {
						toggleSubModal();
						return;
					}
					if (rules.length === 10) {
						toast.error("ルールは10個以上作成できません。");
						return;
					}
					setIsEditMode("copy");
					setRule({
						...params.row,
						name: params.row.name + "のコピー",
					});
					toggle();
				};

				const handleEditClick = () => {
					if (!AVAILABLE_STATUS.includes(guser.status ?? "")) {
						toggleSubModal();
						return;
					}
					setIsEditMode("edit");
					setRule(params.row);
					toggle();
				};

				const handleDeleteClick = () => {
					if (!AVAILABLE_STATUS.includes(guser.status ?? "")) {
						toggleSubModal();
						return;
					}
					setRule(params.row);
					toggleDeleteModal();
				};

				return (
					<div className=''>
						<i
							className='fa-regular fa-clone cursor-pointer p-2 color-primary'
							onClick={() => handleCopyClick()}
						></i>
						<i
							className='fa fa-pencil cursor-pointer p-2 color-primary'
							onClick={() => handleEditClick()}
						></i>
						<i
							className='fa fa-trash-can cursor-pointer p-2 color-error'
							onClick={() => handleDeleteClick()}
						></i>
					</div>
				);
			},
		},
	];

	const handleCreateAndEditAndCopy = (values: any) => {
		if (errorCondMessage || errorTimeMessage || errorPhoneMessage) {
			return;
		}
		let params: any = {
			uid: guser.id,
			name: values.name,
			phones: rule?.phones,
			notif: values.notif,
			conditions: rule?.conditions,
			setting: rule?.setting,
		};
		if (rule?.id) {
			params = { ...params, id: rule?.id };
		}
		switch (isEditMode) {
			case "edit":
				axios
					.put("/api/updateRule", params)
					.then(() => {
						getRules();
						toggle();
					})
					.catch((error) => {
						toast.error(error.response?.data?.message ?? "エラー");
						console.log(error);
					});
				break;
			case "copy":
				axios
					.post("/api/cloneRule", params)
					.then(() => {
						getRules();
						toggle();
					})
					.catch((error) => {
						toast.error(error.response?.data?.message ?? "エラー");
						console.log(error);
					});
				break;
			default:
				axios
					.post("/api/createRule", params)
					.then(() => {
						getRules();
						toggle();
					})
					.catch((error) => {
						toast.error(error.response?.data?.message ?? "エラー");
						console.log(error);
					});
				break;
		}
	};

	const handleDelete = () => {
		axios
			.delete("/api/deleteRule/" + rule?.id)
			.then(() => {
				getRules();
				toggleDeleteModal();
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	};

	const validate = (cd: ConditionItem[]) => {
		const emailRegex = /^[a-zA-Z0-9.@]+$/;
		if (rule) {
			let message = "";
			cd.forEach((item) => {
				if ((item.condName === 3 || item.condName === 4) && !emailRegex.test(item.condText)) {
					message = ERROR_MESSAGE.email;
				}
				if (item.condText.trim().length === 0) {
					message = ERROR_MESSAGE.required;
				}
			});
			setErrorCondMessage(message);
		}
	};

	const validate2 = (st: TimeItem[]) => {
		if (rule) {
			setErrorTimeMessage(st.length === 0 ? ERROR_MESSAGE.mustSelect : "");
		}
	};

	const validate3 = (phones: string[] | null) => {
		if (rule) {
			if (phones) {
				setErrorPhoneMessage(phones.length === 0 ? "電話番号を入力してください。" : "");
				return;
			}
			setErrorPhoneMessage(rule.phones.length === 0 ? "電話番号を入力してください。" : "");
			return;
		}
	};

	const handleAddPhoneNumber = (phone: string) => {
		if (rule && phone.trim()) {
			if (guser.plan && rule.phones.length >= PLAN[guser.plan - 1].regLimit) {
				toast.error("これ以上登録できません。");
				return;
			}
			const updatedPhones = [...(rule.phones || []), phone.trim()];
			setRule({ ...rule, phones: updatedPhones });
			validate3(updatedPhones);
		}
	};

	const removePhone = (phone: string) => {
		if (rule) {
			const updatedPhones = rule.phones.filter((item) => item !== phone);
			setRule({ ...rule, phones: updatedPhones });
			validate3(updatedPhones);
		}
	};

	return (
		<>
			{loading ? (
				<Overlay />
			) : (
				<div>
					<TopHeader title='ルール⼀覧' />
					<div className='m-5'>
						<div className='mb-3 d-flex justify-content-between align-items-center'>
							<Button
								variant='contained'
								color='primary'
								startIcon={<i className='fa fa-plus font12' />}
								sx={buttonStyle}
								onClick={() => {
									if (!AVAILABLE_STATUS.includes(guser.status ?? "")) {
										toggleSubModal();
										return;
									}
									if (rules.length === 10) {
										toast.error("ルールは10個以上作成できません。");
										return;
									}
									setErrorCondMessage("");
									setErrorTimeMessage("");
									setErrorPhoneMessage("");
									setRule(DEFAULT_RULE);
									setIsEditMode(null);
									toggle();
								}}
							>
								<span className='font-bold px-2'>新規作成</span>
							</Button>
							<div className='font16'>{rules.length + "/10 使用中"}</div>
							<div></div>
						</div>

						<div style={{ height: "100%", width: "100%" }}>
							<DataGrid
								rows={rules}
								columns={columns}
								initialState={{
									pagination: {
										paginationModel: {
											page: 0,
											pageSize: 20,
										},
									},
								}}
								editMode='row'
								rowHeight={50}
								autoHeight
								columnHeaderHeight={45}
								sx={{
									"& .MuiDataGrid-columnHeader": {
										backgroundColor: "rgb(229 237 251)",
										fontWeight: "bold",
									},
									"& .MuiDataGrid-columnHeaderTitle": {
										fontWeight: "bold !important",
										color: "#615E5E",
									},
									"& .MuiDataGrid-columnHeader:focus": {
										outline: "none !important",
									},
								}}
								disableColumnMenu
								disableRowSelectionOnClick
								localeText={{
									noRowsLabel: "新しいルールを作成してください。",
									noResultsOverlayLabel: "ssss",
									rowReorderingHeaderName: "ttttttt",
									footerTotalVisibleRows: (visibleCount, totalCount) =>
										`${totalCount.toLocaleString()} 中 ${visibleCount.toLocaleString()}`,
								}}
								hideFooter
							/>
						</div>
					</div>
					<Modal isOpen={isOpen} toggle={toggle} centered size='lg' style={{ width: "600px" }}>
						<ModalBody>
							<div className='mb-2 d-flex justify-content-between'>
								<div className='font-bold font20'>
									{isEditMode === null
										? "ルールの新規作成"
										: isEditMode === "edit"
										? "ルール編集"
										: "ルール複製"}
								</div>
							</div>
							<Formik
								initialValues={{
									name: rule ? rule.name : "",
									phone: "",
									notif: rule ? rule.notif : 1,
									conditions: rule ? rule.conditions : [DEFAULT_CONDITION_ITEM],
									setting: rule ? rule.setting : [],
								}}
								validationSchema={ruleSchema}
								onSubmit={(values) => {
									requestAnimationFrame(() => {
										handleCreateAndEditAndCopy(values);
									});
								}}
							>
								{({ errors, touched, values, setValues }) => (
									<Form className='d-flex flex-column rule-form'>
										<div className='field-label mb-1'>名前</div>
										<Field
											name='name'
											className='input-field-sm'
											placeholder='このルールに名前を付けます'
										/>
										{errors.name && touched.name ? (
											<div className='error'>{errors.name}</div>
										) : null}
										<div className='font-bold m-2'>条件設定</div>
										<div className='condition-box'>
											<ConditionBox
												rule={rule}
												setRule={setRule}
												errorCondMessage={errorCondMessage}
												validate={validate}
											/>
										</div>
										<div className='my-2 me-2'>
											<SwitchDateBox
												rule={rule}
												setRule={setRule}
												errorTimeMessage={errorTimeMessage}
												validate2={validate2}
											/>
										</div>
										<div className='font-bold m-2'>通知設定</div>
										<div className='mb-1'>
											<span className='me-3 field-label'>通知先電話番号</span>
											{errorPhoneMessage && <span className='error'>{errorPhoneMessage}</span>}
										</div>

										{rule && rule.phones.length > 0 && (
											<div className='m-2 d-flex flex-wrap'>
												{rule.phones.map((pp: string) => {
													return (
														<div className='number-tag' key={pp}>
															<span>{pp}</span>
															<i
																className='fa fa-close number-tag-close'
																onClick={() => removePhone(pp)}
															></i>
														</div>
													);
												})}
											</div>
										)}
										<div className='d-flex'>
											<Field
												name='phone'
												className='input-field-sm'
												placeholder='通知を送信する電話番号を設定します'
											/>
											<Button
												variant='contained'
												color='primary'
												sx={{
													...smButtonStyle,
												}}
												size='small'
												className='submit-btn'
												onClick={() => {
													handleAddPhoneNumber(values.phone);
													setValues({
														...values,
														phone: "",
													});
												}}
											>
												<span className='font-bold'>追加</span>
											</Button>
										</div>
										{errors.phone && touched.phone ? (
											<div className='error'>{errors.phone}</div>
										) : null}
										<div className='field-label mt-2 mb-1'>通知方法</div>
										<Field as='select' name='notif' className='input-select-sm'>
											{NOTIF_OPTIONS.map((option) => {
												return (
													<option value={option.value} key={option.value}>
														{option.label}
													</option>
												);
											})}
										</Field>
										{errors.notif && touched.notif ? (
											<div className='error'>{errors.notif}</div>
										) : null}
										<div className='text-center mt-4'>
											<Button
												variant='outlined'
												color='secondary'
												onClick={toggle}
												sx={{
													...smButtonStyle,
													color: "#777777",
												}}
												className='cancel-btn'
											>
												<span className='font-bold'>キャンセル</span>
											</Button>
											<Button
												type='submit'
												variant='contained'
												color='primary'
												className='submit-btn'
												sx={smButtonStyle}
												onClick={() => {
													validate(rule?.conditions ?? []);
													validate2(rule?.setting ?? []);
													validate3(null);
												}}
											>
												<span className='font-bold'>
													{isEditMode === "edit" ? "更新する" : "作成する"}
												</span>
											</Button>
										</div>
									</Form>
								)}
							</Formik>
						</ModalBody>
					</Modal>
					<Modal isOpen={deleteModal} toggle={toggleDeleteModal} centered>
						<ModalBody>
							<div className='m-2 d-flex justify-content-between'>
								<div className='font-bold font16'>ルールを削除します</div>
							</div>
							<div className='m-2'>
								選択したルールを削除してもよろしいですか? この操作は元に戻すことはできません。
							</div>
							<div className='mt-4 text-end'>
								<Button
									variant='outlined'
									color='secondary'
									onClick={toggleDeleteModal}
									className='cancel-btn'
								>
									<span className='font-bold'>キャンセル</span>
								</Button>
								<Button
									type='submit'
									variant='contained'
									color='error'
									className='submit-btn'
									onClick={() => handleDelete()}
								>
									<span className='font-bold'>削除する</span>
								</Button>
							</div>
						</ModalBody>
					</Modal>
					<Modal isOpen={subModal} toggle={toggleSubModal} centered>
						<ModalBody>
							<div className='m-2'>サービスを利用するには、カードを登録して決済してください。</div>
							<div className='mt-4 text-end'>
								<Button
									type='submit'
									variant='contained'
									color='primary'
									className='submit-btn'
									onClick={() => navigate("/my-page")}
								>
									<span className='font-bold color-white'>確認</span>
								</Button>
							</div>
						</ModalBody>
					</Modal>
				</div>
			)}
		</>
	);
}

export default RulesPage;
