import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import prozAlert from "../assets/proz-alert.png";
import { buttonStyle } from "../Constants";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const loginSchema = Yup.object().shape({
	email: Yup.string().required("アカウントを入力してください"),
	password: Yup.string().required("パスワードを入力してください"),
});

const Login = () => {
	const navigate = useNavigate();
	const { setGUser } = useAuth();
	const [isShow, setIsShow] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line
	}, []);

	const handleLogin = (values: any) => {
		const params = {
			email: values.email,
			password: values.password,
		};
		axios
			.post("/api/login", params)
			.then((res) => {
				localStorage.setItem("token", res.data.token);
				axios.defaults.headers.common["x-auth-koken"] = localStorage.getItem("token");
				const data = res.data.user;
				localStorage.setItem("userId", data._id);
				setGUser({
					id: data._id,
					name: data.name,
					email: data.email,
					isAdmin: data.isAdmin,
					card: data.card,
					plan: data.plan,
					usage: data.usage,
					passedUsage: data.passedUsage,
					subscription: data.subscription,
					customer: data.customer,
					status: data.status,
					trialStart: data.trialStart,
					trialEnd: data.trialEnd,
					cancelRequest: data.cancelRequest,
					canceled: data.canceled,
					createdDt: data.created_dt,
					pmail: data.pmail,
				});
				requestAnimationFrame(() => {
					if (res.data.user.isAdmin) {
						navigate("/proz-admin");
					} else {
						navigate("/rules");
					}
				});
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	};

	return (
		<div>
			<div className='cc-container d-flex flex-column align-items-center' style={{ width: "900px" }}>
				<div className='text-center'>
					<img src={prozAlert} className='proz-title' alt='proz-alert' />
				</div>
				<div className='cc-body mt-2 mb-2 text-center'>
					<div className='m-4 font28 font-weight-400 bg-gray py-3'>管理画面ログイン</div>
					<div className='d-flex flex-column align-items-center'>
						<Formik
							initialValues={{
								email: "",
								password: "",
							}}
							validationSchema={loginSchema}
							onSubmit={(values) => {
								handleLogin(values);
							}}
						>
							{({ errors, touched, values }) => (
								<Form className='d-flex flex-column align-items-center login-form'>
									<Field name='email' className='input-field mt-4' />
									{errors.email && touched.email ? <div className='error full-width text-start'>{errors.email}</div> : null}
									<div className='d-flex full-width mt-4 align-items-center'>
										<Field type={isShow ? "text" : "password"} name='password' className='input-field' />
										<span>
											<i
												className={`eye-position cursor-pointer p-2 font16 ${isShow ? "fa fa-eye-slash" : "fa fa-eye"} ${values.password ? "" : "disabled"}`}
												onClick={() => {
													if (!values.password) {
														return;
													}
													setIsShow((prev) => !prev);
												}}
											></i>
										</span>
									</div>
									{errors.password && touched.password ? <div className='error full-width text-start'>{errors.password}</div> : null}
									<div className='color-primary mt-4 full-width text-start'>
										<span
											className='cursor-pointer text-underline font16'
											onClick={() => {
												navigate("/forget-password");
											}}
										>
											パスワードを忘れた方
										</span>
									</div>
									<div className='full-width pb-5'>
										<Button
											type='submit'
											variant='contained'
											color='primary'
											size='large'
											sx={buttonStyle}
											className='mt-3 full-width'
											disabled={!(values.email && values.password)}
										>
											<span className='font-bold px-5'>ログイン</span>
										</Button>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
				<div className='full-width text-left mt-4 text-center'>
					* ログインすると、
					<span className='color-primary text-underline cursor-pointer' onClick={() => window.open("https://drive.google.com/file/d/1Ta91voY5IpNmShXNVDV550IRPFmdpbA5/view", "_blank")}>
						利用規約
					</span>
					、
					<span className='color-primary text-underline cursor-pointer' onClick={() => window.open("https://proz.jp/privacy", "_blank")}>
						プライバシーポリシー
					</span>
					、そして、メール、ニュースレター、最新情報の受信に同意したものとみなされます。
				</div>
			</div>
		</div>
	);
};

export default Login;
