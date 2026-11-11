export const logout = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	localStorage.removeItem("tempUser");
	localStorage.removeItem("userId");
	window.location.href = "/login";
};
