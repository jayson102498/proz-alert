import { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    pmail: string
    password: string
    plan: number
    card: string | null
    usage: number
    passedUsage: object
    changedPlan: number | null
    subscription: string | null
    customer: string | null
    status: string
    isAdmin: boolean
    trialStart: number | null
    trialEnd: number | null
    cancelRequest: number | null
    canceled: number | null
    created_dt: Date
    updated_dt: Date
    deleted_dt: Date | null
}

export interface IRule extends Document {
    uid: Schema.Types.ObjectId
    name: string
    conditions: any
    setting: any
    phones: any
    notif: number
    created_dt: Date
    updated_dt: Date
    deleted_dt: Date | null
}

export interface Condition {
    condName: number
    condText: string
}

export interface TimeSet {
    date: number
    start: string
    end: string
}
