import { useEffect, Dispatch, SetStateAction } from "react";
import { Rule, TimeItem } from "../Interface";
import SwitchDate from "./SwitchDate";

interface ConditionBoxProps {
	rule: Rule | null;
	setRule: Dispatch<SetStateAction<Rule | null>>;
	errorTimeMessage: string;
	validate2: (st: TimeItem[]) => void;
}

const SwitchDateBox = ({
	rule,
	setRule,
	errorTimeMessage,
	validate2,
}: ConditionBoxProps) => {
	useEffect(() => {
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<div>
				<div className="error ms-2">{errorTimeMessage}</div>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={1}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={2}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={3}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={4}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={5}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={6}
				/>
				<SwitchDate
					rule={rule}
					setRule={setRule}
					validate2={validate2}
					index={7}
				/>
			</div>
		</div>
	);
};

export default SwitchDateBox;
