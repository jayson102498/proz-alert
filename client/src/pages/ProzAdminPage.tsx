import React, { useState, useEffect, useCallback } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import TopHeader from "../components/TopHeader";
import Button from "@mui/material/Button";
import { Modal, ModalBody } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { PAYMENT_METHOD_OPTIONS, PLAN, PLAN_OPTIONS, buttonStyle, smButtonStyle } from "../Constants";
import { User } from "../Interface";
import axios from "axios";
import { convertDateTimetoLocalDate, convertTimestampToJapanDate } from "../utils/convert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Overlay from "../components/Overlay";
import { toast } from "react-toastify";

const userSchema = Yup.object().shape({
	name: Yup.string().required("必須項目を入力してください"),
	email: Yup.string().email("正確なメールを入力してください").required("必須項目を入力してください"),
	plan: Yup.number().min(1, "必須項目を入力してください").required("必須項目を入力してください"),
});

function ProzAdminPage() {
	const navigate = useNavigate();
	const { guser, loading } = useAuth();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const toggle = () => setIsOpen((prev) => !prev);
	const [user, setUser] = useState<User | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [isEditMode, setIsEditMode] = useState<boolean>(false);
	const [nestedModal, setNestedModal] = useState(false);
	const [closeAll, setCloseAll] = useState(false);

	const toggleNested = () => {
		setNestedModal(!nestedModal);
		setCloseAll(false);
	};
	const toggleAll = () => {
		setNestedModal(!nestedModal);
		setCloseAll(true);
	};

	const getUsers = useCallback(() => {
		axios
			.get("/api/getUsers")
			.then((res) => {
				console.log(res.data.users);
				const updatedUsers = res.data.users.map((item: any) => ({
					id: item._id,
					name: item.name,
					email: item.email,
					pmail: item.pmail,
					plan: item.plan,
					card: item.card,
					subscription: item.subscription,
					usage: item.usage,
					status: item.status,
					passedUsage: item.passedUsage,
					canceled: item.canceled,
					created_dt: convertDateTimetoLocalDate(item.created_dt),
				}));
				console.log(updatedUsers);
				setUsers(updatedUsers);
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	}, []);

	useEffect(() => {
		if (guser && !loading) {
			if (!guser.isAdmin) {
				navigate("/login");
			}
		}
		getUsers();
		// eslint-disable-next-line
	}, [getUsers, guser, loading]);

	const columns: GridColDef[] = [
		{
			field: "name",
			headerName: "氏名",
			sortable: false,
			resizable: false,
			flex: 1,
		},
		{
			field: "email",
			headerName: "メールアドレス",
			sortable: false,
			resizable: false,
			flex: 1,
		},
		{
			field: "plan",
			headerName: "プラン",
			resizable: false,
			flex: 1,
			renderCell: (params: GridRenderCellParams) => {
				return <div>{PLAN_OPTIONS[params.row.plan].label}</div>;
			},
		},
		{
			field: "passedUsage",
			headerName: "前⽉の通知回数",
			resizable: false,
			flex: 1,
			renderCell: (params: GridRenderCellParams) => {
				return <div>{params.row.passedUsage ? params.row.passedUsage.usage + "/" + PLAN[params.row.passedUsage.limit - 1].notifLimit : ""}</div>;
			},
		},
		{
			field: "currentUsage",
			headerName: "当⽉の通知回数",
			resizable: false,
			flex: 1,
			renderCell: (params: GridRenderCellParams) => {
				return <div>{params.row.usage + "/" + PLAN[params.row.plan - 1].notifLimit}</div>;
			},
		},
		{
			field: "card",
			headerName: "お支払い方法",
			resizable: false,
			flex: 1,
			renderCell: (params: GridRenderCellParams) => {
				return params.row.card ?? "未登録";
			},
		},
		{
			field: "status",
			headerName: "プランステータス",
			resizable: false,
			flex: 1,
			renderCell: (params: GridRenderCellParams) => {
				switch (params.row.status) {
					case "active":
						return <span>利用中</span>;
					case "canceling":
						return <span>解約申請中（{convertTimestampToJapanDate(params.row.canceled)}）</span>;
					case "canceled":
						if (params.row.canceled) {
							return <span>解約済み</span>;
						} else {
							return <span>強制解約済み</span>;
						}
					case "past_due":
						return <span>決済NG</span>;
					case null:
						return <span>登録前</span>;
					default:
						break;
				}
			},
		},
		{
			field: "created_dt",
			headerName: "初回契約日",
			resizable: false,
			flex: 1,
		},
		{
			field: "actions",
			headerName: "",
			sortable: false,
			resizable: false,
			width: 50,
			align: "center",
			renderCell: (params: GridRenderCellParams) => {
				const handleClick = () => {
					setIsEditMode(true);
					setUser(params.row);
					toggle();
				};
				return (
					<div>
						<i className='fa fa-ellipsis-vertical cursor-pointer p-3' onClick={() => handleClick()}></i>
					</div>
				);
			},
		},
	];

	const handleCreateAndEdit = (values: User) => {
		if (isEditMode && user) {
			axios
				.put("/api/updateuser", {
					...values,
					id: user.id,
				})
				.then(() => {
					getUsers();
					toggle();
				})
				.catch((error) => {
					toast.error(error.response?.data?.message ?? "エラー");
					console.log(error);
				});
		} else {
			axios
				.post("/api/createUser", { ...values })
				.then(() => {
					getUsers();
					toggle();
				})
				.catch((error) => {
					toast.error(error.response?.data?.message ?? "エラー");
				});
		}
	};

	const handleDelete = () => {
		axios
			.post("/api/cancalSubscription", {
				id: user?.id,
				subscription: user?.subscription,
				now: true,
			})
			.then(() => {
				getUsers();
				toggleAll();
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
			});
	};

	return (
		<>
			{loading ? (
				<Overlay />
			) : (
				<div>
					<TopHeader title='ユーザー⼀覧' />
					<div className='m-5'>
						<Button
							variant='contained'
							color='primary'
							startIcon={<i className='fa fa-plus font12' />}
							sx={buttonStyle}
							className='mb-3'
							onClick={() => {
								setIsEditMode(false);
								setUser(null);
								toggle();
							}}
						>
							<span className='font-bold px-2'>新規ユーザー作成</span>
						</Button>
						<div style={{ height: "100%", width: "100%" }}>
							<DataGrid
								rows={users}
								columns={columns}
								initialState={{
									pagination: {
										paginationModel: {
											page: 0,
											pageSize: 10,
										},
									},
								}}
								editMode='row'
								pageSizeOptions={[10, 20, 50, 100]}
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
									noRowsLabel: "ユーザーを作成してください。",
									footerTotalVisibleRows: (visibleCount, totalCount) => `${totalCount.toLocaleString()} 中 ${visibleCount.toLocaleString()}`,
								}}
							/>
						</div>
					</div>
					<Modal isOpen={isOpen} toggle={toggle} centered size='lg' style={{ width: "600px" }}>
						<ModalBody>
							<div className='m-2 d-flex justify-content-between'>
								<div className='font-bold font20'>{isEditMode ? "ユーザー編集" : "新規ユーザー作成"}</div>
								{isEditMode && (
									<Button
										variant='contained'
										color='error'
										onClick={() => {
											toggleNested();
										}}
									>
										<span className='font-bold'>削除</span>
									</Button>
								)}
							</div>
							<Formik
								initialValues={{
									name: user ? user.name : "",
									email: user ? user.email : "",
									plan: user ? user.plan : 0,
									card: user ? (user.card === PAYMENT_METHOD_OPTIONS[1].value ? PAYMENT_METHOD_OPTIONS[1].value : PAYMENT_METHOD_OPTIONS[0].value) : PAYMENT_METHOD_OPTIONS[0].value,
								}}
								validationSchema={userSchema}
								onSubmit={(values) => {
									handleCreateAndEdit(values);
								}}
							>
								{({ errors, touched, values }) => (
									<Form className='d-flex flex-column user-form'>
										<div className='field-label mb-1'>名前</div>
										<Field name='name' className='input-field-sm' />
										{errors.name && touched.name ? <div className='error'>{errors.name}</div> : null}
										<div className='field-label mt-3 mb-1'>メールアドレス</div>
										<Field name='email' className='input-field-sm' />
										{errors.email && touched.email ? <div className='error'>{errors.email}</div> : null}
										<div className='field-label mt-3 mb-1'>プラン</div>
										<Field as='select' name='plan' className='input-select-sm'>
											{PLAN_OPTIONS.map((option) => {
												return (
													<option value={option.value} key={option.value}>
														{option.label}
													</option>
												);
											})}
										</Field>
										{errors.plan && touched.plan ? <div className='error'>{errors.plan}</div> : null}
										<div className='field-label mt-3 mb-1'>お支払い方法</div>
										<Field as='select' name='card' className='input-select-sm'>
											{PAYMENT_METHOD_OPTIONS.map((option) => {
												return (
													<option value={option.value} key={option.value}>
														{option.label}
													</option>
												);
											})}
										</Field>
										<div className='' style={{ height: "140px" }}>
											{user && (
												<>
													<div className='d-flex align-items-center m-1 mt-4'>
														<div className='font14 font-bold w-250'>お⽀払い⽅法</div>
														<div className='font14 font-bold'>{values.card === PAYMENT_METHOD_OPTIONS[0].value ? user.card ?? "未登録" : values.card}</div>
													</div>
													<div className='d-flex align-items-center m-1 mt-2'>
														<div className='font14 font-bold w-250'>当⽉の通知回数</div>
														<div className='font14 font-bold'>{user.usage + "/" + PLAN[(user.plan ?? 1) - 1].notifLimit}</div>
													</div>
													<div className='d-flex align-items-center m-1 mt-2'>
														<div className='font14 font-bold w-250'>ご利⽤開始</div>
														<div className='font14 font-bold'>{user?.created_dt ?? null}</div>
													</div>
													<div className='d-flex align-items-center m-1 mt-2'>
														<div className='font14 font-bold w-250'>転送先メールアドレス</div>
														<div className='font14 font-bold'>{user?.pmail ?? ""}</div>
													</div>
												</>
											)}
										</div>
										<div className='text-center mt-5'>
											<Button
												variant='outlined'
												sx={{
													...smButtonStyle,
													color: "#777777",
												}}
												color='secondary'
												onClick={toggle}
												className='cancel-btn'
											>
												<span className='font-bold'>キャンセル</span>
											</Button>
											<Button type='submit' variant='contained' sx={smButtonStyle} color='primary' className='submit-btn'>
												<span className='font-bold'>{isEditMode ? "更新する" : "作成する"}</span>
											</Button>
										</div>
									</Form>
								)}
							</Formik>
							<Modal isOpen={nestedModal} toggle={toggleNested} onClosed={closeAll ? toggle : undefined} centered>
								<ModalBody>
									<div className='m-2 d-flex justify-content-between'>
										<div className='font-bold font16'>このアカウントを削除します</div>
									</div>
									<div className='m-2'>選択したアカウントを削除してもよろしいですか? この操作は元に戻すことはできません。</div>
									<div className='mt-4 text-end'>
										<Button
											variant='outlined'
											color='secondary'
											sx={{
												...smButtonStyle,
												color: "#777777",
											}}
											onClick={toggleNested}
											className='cancel-btn'
										>
											<span className='font-bold'>キャンセル</span>
										</Button>
										<Button type='submit' variant='contained' sx={smButtonStyle} color='error' className='submit-btn' onClick={() => handleDelete()}>
											<span className='font-bold'>削除する</span>
										</Button>
									</div>
								</ModalBody>
							</Modal>
						</ModalBody>
					</Modal>
				</div>
			)}
		</>
	);
}

export default ProzAdminPage;
