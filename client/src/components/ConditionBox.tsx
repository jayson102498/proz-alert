import { useEffect, Dispatch, SetStateAction } from "react";
import { ConditionItem, Rule } from "../Interface";
import ConditionPart from "./ConditionPart";
import { DEFAULT_CONDITION_ITEM } from "../Constants";

interface ConditionBoxProps {
	rule: Rule | null;
	setRule: Dispatch<SetStateAction<Rule | null>>;
	validate: (cd: ConditionItem[]) => void;
	errorCondMessage: string;
}

const ConditionBox = ({
	rule,
	setRule,
	validate,
	errorCondMessage,
}: ConditionBoxProps) => {
	useEffect(() => {
		// eslint-disable-next-line
	}, []);

	const handleAddNewCondition = () => {
		if (rule && rule.conditions.length < 5) {
			const newConditions = [...rule.conditions, DEFAULT_CONDITION_ITEM];
			setRule({ ...rule, conditions: newConditions });
		}
	};

	const handleRemoveCondition = (current: number | undefined) => {
		if (rule && rule.conditions.length > 1 && current) {
			const newConditions = rule.conditions.filter(
				(item, index) => index !== current
			);
			setRule({ ...rule, conditions: newConditions });
			validate(newConditions);
		}
	};

	const handleChange = (
		current: number | undefined,
		changed: ConditionItem
	) => {
		if (rule) {
			const newConditions = rule.conditions.map((item, index) => {
				if (current === index) {
					return changed;
				} else {
					return item;
				}
			});
			setRule({ ...rule, conditions: newConditions });
			validate(newConditions);
		}
	};

	return (
		<div>
			<div className="p-2" style={{ background: "white" }}>
				<div className="error ms-2">{errorCondMessage}</div>
				{rule?.conditions.map((item, index) => (
					<ConditionPart
						item={item}
						handleRemoveCondition={handleRemoveCondition}
						handleChange={handleChange}
						key={index}
						index={index}
					/>
				))}
			</div>
			<div className="mt-1">
				<span
					className="ms-1 cursor-pointer color-primary"
					onClick={() => handleAddNewCondition()}
				>
					<i
						className="fa fa-circle-plus"
						style={{ color: "rgb(49, 166, 220)" }}
					></i>{" "}
					条件を追加する
				</span>
			</div>
		</div>
	);
};

export default ConditionBox;
