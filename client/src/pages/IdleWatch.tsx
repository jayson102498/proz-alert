import React, { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { logout } from "../utils/logout";

/**
 * IdleWatch component.
 *
 * @remarks
 * Log the user out if token does not exist or is invalid.
 *
 * @component IdleWatch
 * @category Component
 */
const IdleWatch = () => {
	const location = useLocation();
	const checkAuth = useCallback(async () => {
		try {
			if (location.pathname !== "rules" && location.pathname !== "my-page" && location.pathname !== "my-page") {
				return;
			}
			const token = localStorage.getItem("token");
			if (token) {
				const res = await axios.post("/api/authToken", {
					token: token,
				});
				if (!res.data.token) {
					logout();
				}
				localStorage.setItem("token", res.data.token);
				axios.defaults.headers.common["x-auth-koken"] = res.data.token;
			} else {
				logout();
			}
		} catch (error) {
			logout();
		}
	}, [location]);

	useEffect(() => {
		// Check authentication on specific events
		checkAuth();
		const eventListener = () => checkAuth();
		document.addEventListener("click", eventListener);
		document.addEventListener("keydown", eventListener);

		return () => {
			// Clean up event listeners
			document.removeEventListener("click", eventListener);
			document.removeEventListener("keydown", eventListener);
		};
	}, [checkAuth, location.pathname]);

	return <React.Fragment />;
};

export default IdleWatch;
