import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";
import { jaJP } from "@mui/material/locale";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { jaJP as jaJP2 } from "@mui/x-date-pickers/locales";
import { AuthProvider } from "./context/AuthContext";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_AXIOS_BASEURL;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["x-auth-koken"] = localStorage.getItem("token");

const theme = createTheme(
	{
		palette: {
			primary: {
				main: "rgb(49, 166, 220)",
			},
			secondary: {
				main: grey[600],
			},
			error: {
				main: red[800],
			},
		},
		components: {
			MuiDataGrid: {
				styleOverrides: {
					root: {
						backgroundColor: "white",
					},
				},
			},
		},
	},
	jaJP
);

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<ThemeProvider theme={theme}>
		<LocalizationProvider
			dateAdapter={AdapterDayjs}
			localeText={
				jaJP2.components.MuiLocalizationProvider.defaultProps.localeText
			}
			adapterLocale="ja"
		>
			<AuthProvider>
				<App />
			</AuthProvider>
		</LocalizationProvider>
	</ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
