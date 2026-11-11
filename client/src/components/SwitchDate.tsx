import React, { useEffect, useState } from "react";
import { DATE_TEXT, DEFAULT_TIME_ITEM } from "../Constants";
import { Rule, TimeItem } from "../Interface";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { Dispatch, SetStateAction } from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import Switch from "@mui/material/Switch";

interface ConditionProps {
	setRule: Dispatch<SetStateAction<Rule | null>>;
	rule: Rule | null;
	index: number;
	validate2: (st: TimeItem[]) => void;
}

const SwitchDate = ({ setRule, rule, index, validate2 }: ConditionProps) => {
	const [isEditable, setIsEditable] = useState<boolean>(
		rule?.setting.find((item) => item.date === index) ? true : false
	);
	const [startTime, setStartTime] = React.useState<dayjs.Dayjs | null>(null);
	const [endTime, setEndTime] = React.useState<dayjs.Dayjs | null>(null);

	useEffect(() => {
		if (isEditable) {
			const current = rule?.setting.find((item) => item.date === index);
			if (current) {
				const date = new Date();
				const [hours1, minutes1] = (current.start || "")
					.split(":")
					.map(Number);
				date.setHours(hours1 || 0, minutes1 || 0, 0, 0);
				setStartTime(dayjs(date));
				const [hours2, minutes2] = (current.end || "")
					.split(":")
					.map(Number);
				date.setHours(hours2 || 0, minutes2 || 0, 0, 0);
				setEndTime(dayjs(date));
			}
		}
	}, [rule, index, isEditable]);

	const handleSelectChange = (value: any, order: number) => {
		if (value === null) {
			return;
		}
		const date = new Date(value.toLocaleString());
		const time = date.getHours() + ":" + date.getMinutes();
		if (rule) {
			const currentSetting = rule.setting;
			const updatedSetting = currentSetting.map((item) => {
				if (item.date === index) {
					return order === 1
						? { ...item, start: time }
						: { ...item, end: time };
				} else {
					return item;
				}
			});
			if (updatedSetting) {
				setRule({ ...rule, setting: updatedSetting });
			}
		}
	};

	const handleSwitchChange = () => {
		if (isEditable) {
			if (rule) {
				const newSetting =
					rule.setting.filter((item) => item.date !== index) ?? [];
				setRule({ ...rule, setting: newSetting });
				setStartTime(null);
				setEndTime(null);
				validate2(newSetting);
			}
		} else {
			if (rule) {
				const newSetting = [
					...rule.setting,
					{ ...DEFAULT_TIME_ITEM, date: index },
				];
				setRule({ ...rule, setting: newSetting });
				validate2(newSetting);
			}
		}
		setIsEditable((prev) => !prev);
	};

	return (
		<div className="m-1">
			<div className="d-flex align-items-center">
				<Switch
					onChange={() => handleSwitchChange()}
					defaultChecked={isEditable}
				/>
				<div className="mx-4 font16 no-wrap">
					{DATE_TEXT.find((text) => text.value === index)?.label}
				</div>
				<TimePicker
					views={["hours", "minutes"]}
					ampm={false}
					localeText={{ okButtonLabel: "確認" }}
					value={startTime}
					onChange={(e) => handleSelectChange(e, 1)}
					disabled={!isEditable}
				/>
				<div className="mx-3 font20">~</div>
				<TimePicker
					views={["hours", "minutes"]}
					ampm={false}
					localeText={{ okButtonLabel: "確認" }}
					value={endTime}
					onChange={(e) => handleSelectChange(e, 2)}
					disabled={!isEditable}
				/>
			</div>
			<div className="error"></div>
		</div>
	);
};

export default SwitchDate;
