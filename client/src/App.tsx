import '@fontsource/roboto'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/400-italic.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RulesPage from './pages/RulesPage'
import ProzAdminPage from './pages/ProzAdminPage'
import MyPage from './pages/MyPage'
import Login from './pages/Login'
import ForgetPassword from './pages/ForgetPassword'
import ResetPassword from './pages/ResetPassword'
import Register from './pages/Register'
import IdleWatch from './pages/IdleWatch'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
	return (
		<BrowserRouter>
			<IdleWatch />
			<Routes>
				<Route path='/' element={<Navigate to='/login' replace />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/rules' element={<RulesPage />} />
				<Route path='/proz-admin' element={<ProzAdminPage />} />
				<Route path='/my-page' element={<MyPage />} />
				<Route path='/forget-password' element={<ForgetPassword />} />
				<Route path='/reset-password/:id' element={<ResetPassword />} />
			</Routes>
			<ToastContainer
				position='bottom-right'
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='light'
			/>
		</BrowserRouter>
	)
}

export default App
