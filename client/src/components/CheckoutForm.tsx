import React, { useState } from "react";
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { PLAN, buttonStyle } from "../Constants";
import { convertTimestampToJapanDate } from "../utils/convert";
import LoadingButton from "@mui/lab/LoadingButton";
import { toast } from "react-toastify";

function CheckoutForm({ toggleCardModal }: any) {
	// collect data from the user
	const { guser, setGUser } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// stripe items
	const stripe = useStripe();
	const elements = useElements();

	// main function
	const createSubscription = async () => {
		try {
			setIsSubmitting(true);
			// create a payment method
			const paymentMethod = await stripe?.createPaymentMethod({
				type: "card",
				card: elements?.getElement(CardNumberElement)!,
				billing_details: {
					name: guser?.name,
					email: guser?.email,
				},
			});

			if (guser && guser.plan) {
				if (guser.status === "active" || guser.status === "past_due") {
					const res = await axios.post("/api/updateCard", {
						paymentMethod: paymentMethod?.paymentMethod?.id,
						id: guser.id,
						customerId: guser.customer,
						card: paymentMethod?.paymentMethod?.card?.brand + " **** **** **** " + paymentMethod?.paymentMethod?.card?.last4,
					});
					if (!res.data.card) {
						toast.error("カード変更に失敗しました。");
					} else {
						toast.success("カード変更に成功しました。");
						toggleCardModal();
						setGUser({
							...guser,
							card: res.data.card,
						});
					}
				} else {
					// call the backend to create subscription
					const res = await axios.post("/api/createSubscription", {
						paymentMethod: paymentMethod?.paymentMethod?.id,
						id: guser.id,
						name: guser.name,
						email: guser.email,
						priceId: PLAN[guser.plan - 1].priceId,
						card: paymentMethod?.paymentMethod?.card?.brand + " **** **** **** " + paymentMethod?.paymentMethod?.card?.last4,
						status: guser.status,
					});
					if (res.data.user.trialEnd) {
						toast.success(
							"※" + convertTimestampToJapanDate(res.data.user.trialEnd) + "までは無料でご利⽤いただけます。それまでに解約⼿続きをしない場合は⾃動的に有料プランが開始されます。"
						);
					} else {
						toast.success("登録に成功しました。");
					}
					toggleCardModal();
					setGUser({
						...guser,
						subscription: res.data.user.subscription,
						customer: res.data.user.customer,
						status: res.data.user.status,
						card: res.data.user.card,
						trialEnd: res.data.user.trialEnd,
						trialStart: res.data.user.trialStart,
					});
				}
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message ?? "お支払いが失敗しました。");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='m-3'>
			<div className='font-bold font18 text-center my-3'>カード情報をご入力ください</div>
			<div className='card-entry'>
				<div>カード番号</div>
				<div className='full-width'>
					<CardNumberElement options={{ showIcon: true }} />
				</div>
			</div>
			<div className='card-entry'>
				<div>有効期限</div>
				<div className='full-width'>
					<CardExpiryElement options={{}} />
				</div>
			</div>
			<div className='card-entry'>
				<div>CVC</div>
				<div className='full-width'>
					<CardCvcElement options={{}} />
				</div>
			</div>
			<div className='d-flex justify-content-center'>
				<LoadingButton
					variant='contained'
					color='primary'
					className='full-width mt-4'
					onClick={createSubscription}
					loading={isSubmitting}
					loadingPosition='end'
					disabled={!stripe || isSubmitting}
					sx={buttonStyle}
				>
					<span className='font-bold color-white'>{guser.status === "active" || guser.status === "past_due" ? "カード変更" : "登録する"}</span>
				</LoadingButton>
			</div>
		</div>
	);
}

export default CheckoutForm;
