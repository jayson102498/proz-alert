import { ConditionItem, Rule, TimeItem } from "./Interface";

export const AVAILABLE_STATUS = ["active", "past_due", "canceling"];

export const PLAN_OPTIONS = [
	{ value: 0, label: "" },
	{ value: 1, label: "ライト" },
	{ value: 2, label: "スタンダード" },
	{ value: 3, label: "エンタープライズ" },
];

export const PAYMENT_METHOD_OPTIONS = [
	{ value: "カード", label: "カード" },
	{ value: "銀行振込", label: "銀行振込" },
];

export const NOTIF_OPTIONS = [
	{ value: 1, label: "SMS" },
	{ value: 2, label: "コール" },
];

export const CONDITION_OPTIONS = [
	{ value: 1, label: "件名" },
	{ value: 2, label: "本⽂" },
	{ value: 3, label: "from" },
	{ value: 4, label: "to" },
];

export const DATE_TEXT = [
	{ value: 1, label: "月曜日" },
	{ value: 2, label: "火曜日" },
	{ value: 3, label: "水曜日" },
	{ value: 4, label: "木曜日" },
	{ value: 5, label: "金曜日" },
	{ value: 6, label: "土曜日" },
	{ value: 7, label: "日曜日" },
];

export const DEFAULT_CONDITION_ITEM: ConditionItem = {
	condName: 1,
	condText: "",
};
export const DEFAULT_TIME_ITEM: TimeItem = {
	date: -1,
	start: "00:00",
	end: "23:59",
};

export const DEFAULT_RULE: Rule = {
	name: "",
	phones: [],
	notif: 1,
	conditions: [DEFAULT_CONDITION_ITEM],
	setting: [],
};

export const ERROR_MESSAGE = {
	required: "全ての項目を入力してください",
	email: "半角英数字を入力してください",
	mustSelect: "曜日を選択してください",
};

export const PLAN = [
	{
		name: "ライト",
		price: 10000,
		ruleLimit: 10,
		notifLimit: 10,
		regLimit: 3,
		priceId: "price_1Pk6m9RxncuooIc7EXODRvsE",
	},
	{
		name: "スタンダード",
		price: 15000,
		ruleLimit: 10,
		notifLimit: 100,
		regLimit: 10,
		priceId: "price_1Pk6mRRxncuooIc7SBFy7v2W",
	},
	{
		name: "エンタープライズ",
		price: 50000,
		ruleLimit: 10,
		notifLimit: 1000,
		regLimit: 100,
		priceId: "price_1Pk6mgRxncuooIc7wejRZI02",
	},
];

export const buttonStyle = {
	height: "50px",
	fontSize: "18px",
	fontWeight: "400",
	fontFamily: "Noto Sans JP",
	color: "white",
};

export const smButtonStyle = {
	fontSize: "16px",
	fontWeight: "400",
	fontFamily: "Noto Sans JP",
	color: "white",
};
