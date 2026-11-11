import Stripe from 'stripe'
import { Request, Response } from 'express'
import User from '../model/user.model'
import Rule from '../model/rule.model'
import moment from 'moment-timezone'
import { sgMailSend } from '../util/sendgrid.util'
import logger from '../util/logger'

const stripe = new Stripe(process.env.STRIPE_SECREAT_KEY ?? '')

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const { id, name, email, paymentMethod, card, priceId, status } = req.body

        if (!paymentMethod) {
            return res.status(400).send({
                message: 'カード情報を正確に入力してください'
            })
        }

        // create a stripe customer
        const customer = await stripe.customers.create({
            name: name,
            email: email,
            payment_method: paymentMethod,
            invoice_settings: {
                default_payment_method: paymentMethod
            }
        })

        // create a stripe subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_settings: {
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'any'
                    }
                },
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription'
            },
            trial_period_days: status === null ? 7 : 0,
            billing_cycle_anchor_config: {
                day_of_month: 1
            },
            expand: ['latest_invoice.payment_intent']
        })

        // return the client secret and subscription id
        if (subscription) {
            const user = await User.findById(id)
            if (user) {
                user.subscription = subscription.id
                user.trialStart = subscription.trial_start ?? null
                user.trialEnd = subscription.trial_end ?? null
                user.cancelRequest = null
                user.canceled = null
                user.customer = customer.id
                user.card = card
                user.status = 'active'
                await user.save()
            }
            return res.status(200).send({
                user: user
            })
        }

        return res.status(401).send({
            message: 'お支払いに失敗しました。'
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: 'サーバーエラー'
        })
    }
}

export const cancalSubscription = async (req: Request, res: Response) => {
    const { id, subscription, now } = req.body

    const japanDate = moment().tz('Asia/Tokyo').format('YYYY-MM-DD')
    const today = moment().unix()
    let endDate = null

    // Convert the japanDate string to a Date object
    const japanDateObj = moment(japanDate, 'YYYY-MM-DD').toDate()
    if (japanDateObj.getDate() < 10) {
        endDate = moment(japanDateObj).endOf('month').unix()
    } else {
        endDate = moment(japanDateObj).add(1, 'month').endOf('month').unix()
    }

    if (now) {
        endDate = moment(japanDateObj).endOf('month').unix()
    }

    try {
        const user = await User.findOne({ _id: id })
        if (subscription && user && user.status !== 'canceled' && user.status !== 'canceling') {
            await stripe.subscriptions.update(subscription, {
                cancel_at: endDate
            })
        }
        if (now && user) {
            if (user.customer) {
                stripe.customers.del(user.customer)
            }
            user.status = 'canceled'
            user.subscription = null
            user.customer = null
            user.cancelRequest = today
            user.canceled = today
            user.deleted_dt = new Date()
            user.save()
            await Rule.deleteMany({ uid: id })
            return res.status(200).json({
                deleted: true,
                status: 'canceled',
                cancelRequest: today,
                canceled: today
            })
        } else if (user && user.trialEnd && user.trialEnd > today) {
            if (user.customer) {
                stripe.customers.del(user.customer)
            }
            const date = moment.unix(user.trialEnd).tz('Asia/Tokyo').format('YYYY/MM/DD')
            sgMailSend({
                to: user.email,
                cc: process.env.SUPPORT_MAIL ?? '',
                id: process.env.SENDGRID_D_CANCEL ?? '',
                name: user.name,
                date: date
            })
            await User.updateOne(
                { _id: id },
                {
                    $set: {
                        status: 'canceling',
                        cancelRequest: today,
                        canceled: user.trialEnd
                    }
                }
            )
            return res.status(200).json({
                status: 'canceling',
                cancelRequest: today,
                canceled: user.trialEnd
            })
        } else {
            if (user) {
                const date = moment
                    .unix(endDate - 86400)
                    .tz('Asia/Tokyo')
                    .format('YYYY/MM/DD')
                sgMailSend({
                    to: user.email,
                    cc: process.env.SUPPORT_MAIL ?? '',
                    id: process.env.SENDGRID_D_CANCEL ?? '',
                    name: user.name,
                    date: date
                })
            }
            await User.updateOne(
                { _id: id },
                {
                    $set: {
                        status: 'canceling',
                        cancelRequest: today,
                        canceled: endDate - 86400
                    }
                }
            )
            return res.status(200).json({
                status: 'canceling',
                cancelRequest: today,
                canceled: endDate
            })
        }
    } catch (error: any) {
        logger.error(error)
        if (
            error?.type === 'StripeInvalidRequestError' &&
            error?.raw?.message === 'A canceled subscription can only update its cancellation_details.'
        ) {
            try {
                await User.updateOne(
                    { _id: id },
                    {
                        $set: {
                            status: 'canceling',
                            cancelRequest: today,
                            canceled: endDate
                        }
                    }
                )
                return res.status(200).json({
                    status: 'canceling',
                    cancelRequest: today,
                    canceled: endDate
                })
            } catch (error) {
                return res.status(500).send({
                    message: 'サーバーエラー'
                })
            }
        }
        return res.status(500).send({
            message: 'サーバーエラー'
        })
    }
}

export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id, subscription, plan, priceId } = req.body

        const user = await User.findById(id)
        if (user && (user.card === '銀行振込' || user.card === null || user.status === 'canceled')) {
            user.changedPlan = user.plan
            user.plan = plan
            user.save()
            return res.status(200).json({ plan: plan })
        }
        const subscriptionData = await stripe.subscriptions.retrieve(subscription)
        const response = await stripe.subscriptions.update(subscription, {
            items: [
                {
                    id: subscriptionData.items.data[0].id,
                    price: priceId
                }
            ],
            proration_behavior: 'none'
        })

        if (response && (response.status === 'active' || response.status === 'trialing' || response.status === 'past_due')) {
            const updatedUser = await User.findById({ _id: id })
            if (updatedUser) {
                updatedUser.changedPlan = updatedUser.plan
                updatedUser.plan = plan
                updatedUser.save()
                return res.status(200).json({ plan: plan })
            } else {
                return res.status(404).json({ message: 'ユーザーが見つかりません。' })
            }
        } else {
            return res.status(400).send({
                message: 'プランを変更することはできません。 システム管理部にお問い合わせください。'
            })
        }
    } catch (error: any) {
        logger.error(error)
        if (
            error?.type === 'StripeInvalidRequestError' &&
            error?.raw?.message === 'A canceled subscription can only update its cancellation_details.'
        ) {
            return res.status(400).send({
                message: 'サブスクリプションはすでにキャンセルされました。'
            })
        }
        return res.status(500).send({
            message: 'サーバーエラー'
        })
    }
}

export const updateCard = async (req: Request, res: Response) => {
    try {
        const { id, customerId, paymentMethod, card } = req.body
        if (!paymentMethod) {
            return res.status(400).send({
                message: 'カード情報を正確に入力してください'
            })
        }
        // attach new payment method
        const r1 = await stripe.paymentMethods.attach(paymentMethod, {
            customer: customerId
        })
        // set default payment method
        const r2 = await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethod
            }
        })
        await User.updateOne({ _id: id }, { $set: { card: card } })
        return res.status(200).json({ card: card })
    } catch (error: any) {
        logger.error(error)
        if (error?.type === 'StripeInvalidRequestError') {
            return res.status(400).send({
                message: 'カードを変更することはできません。 システム管理部にお問い合わせください。'
            })
        }
        return res.status(500).send({
            message: 'サーバーエラー'
        })
    }
}

export const handleHook = async (req: Request, res: Response) => {
    const event = req.body

    switch (event.type) {
        case 'customer.subscription.deleted':
            const customerSubscriptionDeleted = event.data.object
            try {
                const user = await User.findOne({
                    subscription: customerSubscriptionDeleted.id,
                    deleted_dt: null
                })
                if (user && user.status === 'past_due') {
                    sgMailSend({
                        to: user.email,
                        cc: process.env.SUPPORT_MAIL ?? '',
                        id: process.env.SENDGRID_D_FORCECANCEL ?? '',
                        name: user.name,
                        date: moment().tz('Asia/Kolkata').format('YYYY/MM/DD')
                    })
                    const customer = user.customer
                    user.status = customerSubscriptionDeleted.status
                    user.subscription = null
                    user.customer = null
                    user.save()
                    if (customer) stripe.customers.del(customer)
                }
            } catch (error) {
                logger.error(error)
            }
            break
        case 'customer.subscription.updated':
            const customerSubscriptionUpdated = event.data.object
            try {
                const user = await User.findOne({
                    subscription: customerSubscriptionUpdated.id,
                    deleted_dt: null
                })
                if (user && user.status === 'active' && customerSubscriptionUpdated.status === 'past_due') {
                    user.status = customerSubscriptionUpdated.status
                    user.save()
                    sgMailSend({
                        to: user.email,
                        id: process.env.SENDGRID_D_PAYMENTFAILED ?? '',
                        cc: process.env.SUPPORT_MAIL ?? '',
                        name: user.name
                    })
                }
            } catch (error) {
                logger.error(error)
            }
            break
        default:
            logger.error(`Unhandled event type ${event.type}`)
    }
    res.json({ received: true })
}
