import { model, Schema, Model } from 'mongoose';
import { IRule } from '../interface/interfaces';

const RuleSchema: Schema<IRule> = new Schema<IRule>({
    uid: { type: Schema.Types.ObjectId, ref: "User", required: true},
    name: { type: String, required: true },
    conditions: { type: Array, required: true },
    setting: { type: Array, required: true },
    phones: { type: Array, required: true },
    notif: { type: Number, required: true },
    created_dt: { type: Date, default: Date.now },
    updated_dt: { type: Date, default: Date.now },
});

const RuleModel: Model<IRule> = model<IRule>('Rule', RuleSchema);

export default RuleModel;