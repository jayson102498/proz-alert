import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY ?? "");

function CheckoutFormWrapper({ toggleCardModal }: any) {
	return (
		<div>
			<Elements stripe={stripePromise}>
				<CheckoutForm toggleCardModal={toggleCardModal} />
			</Elements>
		</div>
	);
}

export default CheckoutFormWrapper;
