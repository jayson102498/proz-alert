import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import prozAlert from '../assets/proz-alert.png'
import { buttonStyle } from '../Constants'
import axios from 'axios'
import { toast } from 'react-toastify'

const emailSchema = Yup.object().shape({
	newPassword: Yup.string().required('新しいパスワードを入力してください'),
	confirmPassword: Yup.string()
		.required('確認パスワードを入力してください')
		.oneOf([Yup.ref('newPassword')], 'パスワードが一致しません'),
})

const ResetPassword = () => {
	const navigate = useNavigate()
	const param = useParams()
	const [isNewPasswordShow, setIsNewPasswordShow] = useState<boolean>(false)
	const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState<boolean>(false)
	const [isSubmited, setIsSubmited] = useState<boolean>(false)

	useEffect(() => {
		// eslint-disable-next-line
	}, [])

	const handlePasswordReset = (values: any) => {
		if (!param) {
			toast.error('無効なリンクです。')
			return
		}

		axios
			.post('/api/resetPassword', {
				token: param.id,
				password: values.newPassword,
			})
			.then(() => {
				setIsSubmited(true)
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? 'エラー')
				console.log(error)
			})
	}

	return (
		<div>
			<div className='cc-container d-flex flex-column align-items-center' style={{ width: '900px' }}>
				<div className='text-center'>
					<img src={prozAlert} className='proz-title' alt='proz-alert' />
				</div>
				{!isSubmited ? (
					<div className='cc-body mt-2 text-center'>
						<div className='mt-5 mb-3 font20 font-bold'>新しいパスワードを作成する</div>
						<div className='d-flex flex-column align-items-center'>
							<Formik
								initialValues={{
									newPassword: '',
									confirmPassword: '',
								}}
								validationSchema={emailSchema}
								onSubmit={(values) => {
									handlePasswordReset(values)
								}}
							>
								{({ errors, touched, values }) => (
									<Form className='d-flex flex-column align-items-center' style={{ width: '400px' }}>
										<div className='font16 mt-4 full-width text-start mb-1'>新しいパスワード</div>
										<div className='d-flex full-width align-items-center'>
											<Field
												type={isNewPasswordShow ? 'text' : 'password'}
												name='newPassword'
												className='input-field'
											/>
											<span>
												<i
													className={`eye-position cursor-pointer p-2 font16 ${
														isNewPasswordShow ? 'fa fa-eye-slash' : 'fa fa-eye'
													} ${values.newPassword ? '' : 'disabled'}`}
													onClick={() => {
														if (!values.newPassword) {
															return
														}
														setIsNewPasswordShow((prev) => !prev)
													}}
												></i>
											</span>
										</div>
										{errors.newPassword && touched.newPassword ? (
											<div className='error full-width text-start'>{errors.newPassword}</div>
										) : null}
										<div className='mt-4 font16 full-width text-start mb-1'>新しいパスワードを再度入力してください</div>
										<div className='d-flex full-width align-items-center'>
											<Field
												type={isConfirmPasswordShow ? 'text' : 'password'}
												name='confirmPassword'
												className='input-field'
											/>
											<span>
												<i
													className={`eye-position cursor-pointer p-2 font16 ${
														isConfirmPasswordShow ? 'fa fa-eye-slash' : 'fa fa-eye'
													} ${values.confirmPassword ? '' : 'disabled'}`}
													onClick={() => {
														if (!values.confirmPassword) {
															return
														}
														setIsConfirmPasswordShow((prev) => !prev)
													}}
												></i>
											</span>
										</div>
										{errors.confirmPassword && touched.confirmPassword ? (
											<div className='error full-width text-start'>{errors.confirmPassword}</div>
										) : null}
										<div className='mt-5 mb-5 d-flex align-items-center'>
											<Button
												type='submit'
												variant='contained'
												color='primary'
												size='large'
												sx={buttonStyle}
												className='full-width'
												disabled={!(values.newPassword && values.confirmPassword)}
											>
												<span className='font-bold px-3 no-wrap'>パスワードの再設定</span>
											</Button>
										</div>
									</Form>
								)}
							</Formik>
						</div>
					</div>
				) : (
					<div className='cc-body mt-2 text-center'>
						<div className='mt-5 mb-3 font20 font-bold'>パスワード再設定が完了しました</div>
						<div className='mt-3 mb-3 font16'>
							パスワードの再設定が完了いたしました。
							<br></br>
							新しいパスワードで再度ログイン画面よりログインを行なってください。
						</div>
						<div className='mt-4 mb-5'>
							<Button
								variant='outlined'
								color='primary'
								size='large'
								className='me-2'
								onClick={() => navigate('/login')}
							>
								<span className='font-bold px-3 no-wrap'>戻る</span>
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default ResetPassword
