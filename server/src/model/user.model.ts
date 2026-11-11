import { model, Schema, Model } from 'mongoose'
import { IUser } from '../interface/interfaces'

const UserSchema: Schema<IUser> = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    pmail: { type: String, required: true },
    password: { type: String, required: true },
    plan: { type: Number, required: true },
    card: { type: String, default: null },
    trialEnd: { type: Number, default: null },
    trialStart: { type: Number, default: null },
    cancelRequest: { type: Number, default: null },
    canceled: { type: Number, default: null },
    usage: { type: Number, default: 0 },
    passedUsage: { type: Object, default: null },
    changedPlan: { type: Number, default: null },
    subscription: { type: String, default: null },
    customer: { type: String, default: null },
    status: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    created_dt: { type: Date, default: Date.now },
    updated_dt: { type: Date, default: Date.now },
    deleted_dt: { type: Date, default: null }
})

const UserModel: Model<IUser> = model<IUser>('User', UserSchema)

export default UserModel
