import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { PLAN_OPTIONS, buttonStyle } from '../Constants'
import axios from 'axios'
import prozAlert from '../assets/proz-alert.png'
import { toast } from 'react-toastify'

const loginSchema = Yup.object().shape({
	name: Yup.string().required('アカウントを入力してください'),
	email: Yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスを入力してください'),
	password: Yup.string().required('パスワードを入力してください'),
	plan: Yup.number().min(1, 'プランを選択してください').required('プランを選択してください'),
})

interface User {
	name: string
	email: string
	password: string
	plan: number
}

const Register = () => {
	const navigate = useNavigate()
	const [isShow, setIsShow] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)

	const handleRegister = (value: User) => {
		axios
			.post('/api/register', value)
			.then(() => {
				setIsSubmitted(true)
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? 'エラー')
				console.log(error)
			})
	}

	return (
		<div>
			<div className='cc-container d-flex flex-column align-items-center' style={{ width: '680px' }}>
				{isSubmitted ? (
					<div className='cc-body mt-2 text-center'>
						<div className='mt-5 font18 font-bold'>ご登録ありがとうございました</div>
						<div className='mt-4 font16'>
							ご登録のメールアドレス宛に<br></br>
							ログイン⽅法等を記載したメールをお送りいたします
						</div>
						<div className='mt-4 font16'>
							5分以上経っても届かない場合は<br></br>
							以下のメールアドレスまでお問い合わせください
						</div>
						<div className='mt-4 font16'>問い合わせ：info@prozalert.jp</div>
						<Button
							variant='contained'
							color='primary'
							size='large'
							className='my-5'
							sx={buttonStyle}
							onClick={() => navigate('/')}
						>
							<span className='font-bold px-4 no-wrap'>トップに戻る</span>
						</Button>
					</div>
				) : (
					<>
						<div className='text-center'>
							<img src={prozAlert} alt='proz-alert' className='proz-title'></img>
						</div>
						<div className='cc-body mt-2 text-center'>
							<div className='d-flex flex-column align-items-center'>
								<Formik
									initialValues={{
										name: '',
										email: '',
										password: '',
										plan: 0,
									}}
									validationSchema={loginSchema}
									onSubmit={(values) => {
										handleRegister(values)
									}}
								>
									{({ errors, touched, values }) => (
										<Form className='d-flex flex-column align-items-center' style={{ width: '500px' }}>
											<div className='d-flex mt-4 full-width'>
												<div className='input-label text-start'>お名前</div>
												<div className='full-width'>
													<Field name='name' className='input-field' />
													{errors.name && touched.name ? (
														<div className='error full-width text-start'>{errors.name}</div>
													) : null}
												</div>
											</div>
											<div className='d-flex mt-4 full-width'>
												<div className='input-label text-start'>メールアドレス</div>
												<div className='full-width'>
													<Field name='email' className='input-field' />
													{errors.email && touched.email ? (
														<div className='error full-width text-start'>{errors.email}</div>
													) : null}
												</div>
											</div>
											<div className='d-flex mt-4 full-width'>
												<div className='input-label text-start'>パスワード</div>
												<div className='full-width'>
													<div className='d-flex align-items-center'>
														<Field type={isShow ? 'text' : 'password'} name='password' className='input-field' />
														<span>
															<i
																className={`eye-position cursor-pointer p-2 font16 ${
																	isShow ? 'fa fa-eye-slash' : 'fa fa-eye'
																} ${values.password ? '' : 'disabled'}`}
																onClick={() => {
																	if (!values.password) {
																		return
																	}
																	setIsShow((prev) => !prev)
																}}
															></i>
														</span>
													</div>
													{errors.password && touched.password ? (
														<div className='error full-width text-start'>{errors.password}</div>
													) : null}
												</div>
											</div>
											<div className='d-flex mt-4 full-width'>
												<div className='input-label text-start'>ご利⽤プラン</div>
												<div className='full-width'>
													<Field as='select' name='plan' className='input-select'>
														{PLAN_OPTIONS.map((option) => {
															return (
																<option value={option.value} key={option.value}>
																	{option.label}
																</option>
															)
														})}
													</Field>
													{errors.plan && touched.plan ? (
														<div className='error full-width text-start'>{errors.plan}</div>
													) : null}
													<div className='my-3 font16'></div>
												</div>
											</div>
											<Button
												type='submit'
												variant='contained'
												color='primary'
												size='large'
												sx={buttonStyle}
												className='mt-5 mb-4 full-width'
											>
												<span className='font-bold px-4 no-wrap'>登 録</span>
											</Button>
										</Form>
									)}
								</Formik>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default Register
