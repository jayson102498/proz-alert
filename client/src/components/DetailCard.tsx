import { PLAN } from "../Constants";

const DetailCard = ({ num, plan }: { num: number; plan: number }) => {
	return (
		<div className="detail-card me-4 mb-3" style={{ width: "100%" }}>
			<div className="d-flex justify-content-between font16 font-bold p-2 cursor-pointer">
				<div className="d-flex align-items-center">
					<i
						className={`fa ${
							num === plan ? "fa-angle-down" : "fa-angle-right"
						} color-primary me-2`}
					></i>
					<div>{PLAN[num - 1].name}</div>
				</div>
				<div className="me-4">{PLAN[num - 1].price + "円∕⽉"}</div>
			</div>
			{num === plan && (
				<div className="text-center p-3 border-top">
					<div className="d-flex text-start">
						<div className="w-250">通知ルール数</div>
						<div>{PLAN[num - 1].ruleLimit}</div>
					</div>
					<div className="d-flex text-start">
						<div className="w-250">⽉間通知回数上限</div>
						<div>{PLAN[num - 1].notifLimit}</div>
					</div>
					<div className="d-flex text-start">
						<div className="w-250">
							通知先登録数（1ルールあたり）
						</div>
						<div>{PLAN[num - 1].regLimit}</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailCard;
