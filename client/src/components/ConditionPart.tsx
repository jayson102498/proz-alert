import { CONDITION_OPTIONS } from "../Constants";
import { ConditionItem } from "../Interface";

interface ConditionProps {
	handleRemoveCondition: (current: number | undefined) => void;
	handleChange: (current: number | undefined, changed: ConditionItem) => void;
	item: ConditionItem;
	index: number;
}

function Condition({
	handleRemoveCondition,
	handleChange,
	item,
	index,
}: ConditionProps) {
	const handleSelectChange = (value: any) => {
		const changed = { ...item, condName: parseInt(value) };
		handleChange(index, changed);
	};

	const handleInputChange = (value: any) => {
		const changed = { ...item, condText: value };
		handleChange(index, changed);
	};

	return (
		<div className="m-1">
			<div className="d-flex align-items-center">
				<select
					name="notif"
					className="p-1"
					style={{ width: "70px" }}
					onChange={(e) => handleSelectChange(e.target.value)}
					value={item.condName}
				>
					{CONDITION_OPTIONS.map((condition) => {
						return (
							<option
								value={condition.value}
								key={condition.value}
							>
								{condition.label}
							</option>
						);
					})}
				</select>
				<div className="mx-2">は</div>
				<input
					name="condition"
					className="input-field-sm py-1 px-2"
					placeholder="テキストを入力してください"
					style={{ width: "310px" }}
					value={item.condText}
					onChange={(e) => handleInputChange(e.target.value)}
				></input>
				<div className="mx-2">を含む</div>
				{index > 0 && (
					<div
						className="color-error ms-4 cursor-pointer"
						onClick={() => handleRemoveCondition(index)}
					>
						<i className="fa-regular fa-square-minus"></i>
					</div>
				)}
			</div>
		</div>
	);
}

export default Condition;
