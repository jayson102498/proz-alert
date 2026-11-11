import axios from "axios";
import img_avatar from "../assets/avatar.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface TopHeaderProps {
	title: string;
}

function TopHeader({ title }: TopHeaderProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { guser } = useAuth();

	const handleReturn = () => {
		axios
			.get("/api/getUser/" + guser?.id)
			.then((res) => {
				if (res.data.user.isAdmin) {
					navigate("/proz-admin");
					return;
				}
				navigate("/rules");
			})
			.catch((error) => {
				toast.error(error.response?.data?.message ?? "エラー");
				console.log(error);
			});
	};

	return (
		<div className='top-header d-flex justify-content-between'>
			<div className='top-header-title px-5 color-gray font28 font-weight-400'>{title}</div>
			{location.pathname === "/my-page" ? (
				<div className='top-header-name px-5 d-flex align-items-center'>
					<img src={img_avatar} alt='proz' className='top-header-avatar mx-3'></img>
					{guser && <span className='color-gray'>{guser.name}</span>}
					{location.pathname === "/my-page" && (
						<div className='cursor-pointer' onClick={() => handleReturn()}>
							<i className='fa-regular fa-circle-xmark font24 ms-3'></i>
						</div>
					)}
				</div>
			) : (
				<div
					className='top-header-name px-5 d-flex align-items-center cursor-pointer'
					onClick={() => {
						navigate("/my-page");
					}}
				>
					<img src={img_avatar} alt='proz' className='top-header-avatar mx-3'></img>
					{guser && <span>{guser.name}</span>}
				</div>
			)}
		</div>
	);
}

export default TopHeader;
