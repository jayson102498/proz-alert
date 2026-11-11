import moment from "moment";

export const convertDateTimetoLocalDate = (dateString: string): string => {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	};
	return date.toLocaleString("ja-JP", options);
};

export const convertTimestampToJapanDate = (timestamp: number) => {
	return moment.unix(timestamp).format("YYYY/M/DD");
};
