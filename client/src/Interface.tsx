export interface User {
	id?: number;
	name?: string;
	email?: string;
	plan?: number;
	card?: string;
	usage?: number;
	pmail?: string;
	subscription?: string;
	created_dt?: string;
}

export interface Rule {
	id?: number;
	uid?: string;
	name: string;
	phones: string[];
	notif: number;
	conditions: ConditionItem[];
	setting: TimeItem[];
}

export interface ConditionItem {
	condName: number;
	condText: string;
	order?: number;
}

export interface TimeItem {
	date: number;
	start?: string;
	end?: string;
}
