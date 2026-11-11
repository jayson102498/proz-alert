import React, { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../utils/logout";

export type IAuth = {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
	card: string;
	plan: number | null;
	usage: number;
	passedUsage: object | null;
	subscription: string | null;
	customer: string | null;
	status: string | null;
	trialStart: number | null;
	trialEnd: number | null;
	cancelRequest: number | null;
	canceled: number | null;
	createdDt: string;
	pmail: string;
};

type IAuthContext = {
	guser: IAuth;
	setGUser: (val: IAuth) => void;
	loading: boolean;
};

export const AuthContext: React.Context<IAuthContext> = React.createContext({} as IAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const [loading, setLoading] = useState(true);
	const [guser, setGUser] = useState<IAuth>({
		id: "",
		name: "",
		email: "",
		isAdmin: false,
		card: "",
		plan: null,
		usage: 0,
		passedUsage: null,
		subscription: null,
		customer: null,
		status: null,
		trialStart: null,
		trialEnd: null,
		cancelRequest: null,
		canceled: null,
		createdDt: "",
		pmail: "",
	});

	useEffect(() => {
		const initAuth = async () => {
			const userId = localStorage.getItem("userId");
			if (userId) {
				try {
					const res = await axios.get("/api/getUser/" + userId);
					if (res) {
						const data = res.data.user;
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
					} else {
						logout();
					}
				} catch (error) {
					console.error("Authentication error:", error);
					logout();
				}
			}
			setLoading(false);
		};

		initAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				guser,
				setGUser,
				loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): IAuthContext => React.useContext(AuthContext);
