import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { buttonStyle } from '../Constants'
import prozAlert from '../assets/proz-alert.png'
import axios from 'axios'
import { toast } from 'react-toastify'

const emailSchema = Yup.object().shape({
	email: Yup.string().email('有効なメールアドレスを入力してください').required('メールアドレスを入力してください'),
})

const ForgetPassword = () => {
	const navigate = useNavigate()
	const [isSubmited, setIsSubmited] = useState<boolean>(false)

	useEffect(() => {
		// eslint-disable-next-line
	}, [])

	const handlePasswordReset = (values: any) => {
		axios
			.post('/api/getResetToken', values)
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
						<div className='mt-5 mb-3 font20 font-bold'>パスワードをお忘れですか？</div>
						<div className='mt-3 mb-3 font16'>メールアドレスを入力し、パスワードのリセット手順を確認してください。</div>
						<div className='d-flex flex-column align-items-center'>
							<Formik
								initialValues={{
									email: '',
								}}
								validationSchema={emailSchema}
								onSubmit={(values) => {
									handlePasswordReset(values)
								}}
							>
								{({ errors, touched }) => (
									<Form className='d-flex flex-column align-items-center'>
										<Field name='email' className='input-field mt-2' />
										{errors.email && touched.email ? (
											<div className='error full-width text-start'>{errors.email}</div>
										) : null}
										<div className='mt-4 mb-5 d-flex align-items-center'>
											<Button
												variant='outlined'
												color='primary'
												size='large'
												className='me-2'
												sx={{ height: '50px' }}
												onClick={() => navigate('/login')}
											>
												<span className='font-bold px-3 no-wrap color-primary'>戻る</span>
											</Button>
											<Button
												type='submit'
												variant='contained'
												color='primary'
												size='large'
												sx={buttonStyle}
												className='full-width'
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
						<div className='mt-5 mb-3 font20 font-bold'>メールを送信しました</div>
						<div className='mt-3 mb-3 font16'>
							パスワードのリセット手順を記載したメールを送信しました。
							<br></br>
							メールに記載された手順に沿ってパスワードの再設定を行なってください。
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

export default ForgetPassword
