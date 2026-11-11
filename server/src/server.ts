import express, { Router, Request, Response } from 'express'
import { routes, authroutes } from './routes'
import dotenv from 'dotenv'
import cors from 'cors'
import cron from 'node-cron'
import connectDB from './db/db.config'
import { ImapFlow } from 'imapflow'
import { AddressObject, simpleParser } from 'mailparser'
import { Call, sendSMS } from './util/twilio.util'
import { sgMailSend, sendDirectMessage } from './util/sendgrid.util'
import Rule from '../src/model/rule.model'
import User from '../src/model/user.model'
import { checkIsAvailableTime } from './util/time.util'
import { getValidPhoneNumber, removeSpecialChars } from './util/crypto.util'
import { updateUsage } from './controller/user.controller'
import moment from 'moment-timezone'
import logger from './util/logger'

dotenv.config()

connectDB()

const expressPort: string | number = process.env.SERVER_PORT || 5000
const app = express()
const router = Router()

// use json for API routes
app.use(express.json())

// cors for api address/port
app.use(
    cors({
        credentials: true,
        origin: '*'
    })
)

// Routes without authentication
routes(router)

// Routes with authentication
authroutes(router)

app.use(router)

app.get('/', (req: Request, res: Response) => {
    res.send('INFO :: Root route called')
})

async function fetchNewEmails(count: number, client: any) {
    try {
        // Getting a list of rules
        const rules = await Rule.find({}).populate('uid')
        const filteredRules = rules.filter(
            (rule: any) => rule.uid.status === 'active' || rule.uid.status === 'past_due' || rule.uid.status === 'canceling'
        )

        // Store mail information in a variable
        for await (let msg of client.fetch(`1:${count}`, { envelope: true, source: true })) {
            const parsed = await simpleParser(msg.source)
            if (parsed) {
                const subject = parsed.subject ?? ''
                const body = parsed.text ?? ''
                const to = (parsed.to as AddressObject)?.value.map((item: any) => item.address) || []
                const from = parsed.from?.value.map((item: any) => item.address) || []
                const xForwardedTo = parsed.headers.get('X-Forwarded-To')?.toString().split(' ') || []
                const toEmails = [...to, ...xForwardedTo]

                filteredRules.forEach(async (rule: any) => {
                    const userEmail = rule.uid.email
                    const setting = rule.setting

                    // Separate each condition in the rule.
                    let ruleSubjects = rule.conditions.filter((cond: any) => cond.condName === 1).map((cond: any) => cond.condText)
                    let ruleBodys = rule.conditions.filter((cond: any) => cond.condName === 2).map((cond: any) => cond.condText)
                    const ruleFrom = rule.conditions.find((cond: any) => cond.condName === 3)?.condText ?? null
                    const ruleTo = rule.conditions.find((cond: any) => cond.condName === 4)?.condText ?? null

                    // Conditional checking
                    if (toEmails.some((email: any) => (!ruleTo && email.includes(userEmail)) || (ruleTo && email.includes(ruleTo)))) {
                        if (from.some((email: any) => email.includes(ruleFrom)) || ruleFrom === null) {
                            if (ruleSubjects.every((sub: string) => subject.includes(sub)) || ruleSubjects.length === 0) {
                                if (ruleBodys.every((bb: string) => body.includes(bb)) || ruleBodys.length === 0) {
                                    if (checkIsAvailableTime(setting)) {
                                        // Notification sentences
                                        const sayText =
                                            body && body.length >= 480
                                                ? removeSpecialChars(body?.substring(0, 480))
                                                : removeSpecialChars(body ?? '')

                                        // Send a notification.
                                        rule.phones.forEach(async (phone: string) => {
                                            const phoneNumber = getValidPhoneNumber(phone)
                                            if (phoneNumber !== false) {
                                                if (rule.notif === 1) {
                                                    await sendSMS(phoneNumber, 'Prozアラートです。\n' + subject + '\n' + sayText + '...')
                                                    await updateUsage(rule.uid._id)
                                                    logger.info('sent to ' + phoneNumber)
                                                } else if (rule.notif === 2) {
                                                    await Call(phoneNumber, 'Prozアラートです。\n' + subject + '\n' + sayText + '...')
                                                    await updateUsage(rule.uid._id)
                                                    logger.info('called to ' + phoneNumber)
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        }
                    }
                })
                logger.info('checked: ' + subject + ', from: ' + from + ', to: ' + toEmails.join(','))
            }
        }

        await client.messageMove('1:*', 'Trash')
    } catch (error) {
        logger.error('Email Watching Error :: ' + error)
    }
}

const IMAP_CONFIG: any = {
    host: process.env.MAIL_HOST ?? '',
    port: 993,
    auth: {
        user: process.env.MAIL_USER ?? '',
        pass: process.env.MAIL_PASS ?? ''
    },
    logger: false,
    secure: true
}

async function connectToIMAP() {
    try {
        const client = new ImapFlow(IMAP_CONFIG)
        await client.connect()
        logger.info('Connected to IMAP server')

        // Open the INBOX
        await client.mailboxOpen('INBOX')
        logger.info('Inbox opened')

        // Start listening for new messages
        client.on('exists', (data) => {
            if (data.count > data.prevCount) {
                logger.info(`${data.count - data.prevCount} New mail received`)
                fetchNewEmails(data.count - data.prevCount, client)
            }
        })

        client.on('error', (err) => {
            logger.info(`IMAP error occured :: ${err.message}`)
        })

        client.on('close', () => {
            logger.info(`IMAP connection closed`)
            connectToIMAP()
        })

        await client.idle()
    } catch (error) {
        logger.error('Connected to IMAP :: ', error)
        sendDirectMessage({ to: 'kanta.2000.canta@gmail.com', content: 'Proz :: IMAP server is closed' })
    }
}

connectToIMAP()

// Send mail if the card is not registered
cron.schedule(
    '00 00 09 * * *',
    async () => {
        try {
            const users = await User.find({
                subscription: null,
                status: null,
                isAdmin: false,
                deleted_dt: null
            })
            const currentLocalDate = moment.tz('Asia/Tokyo').startOf('day')
            if (users.length) {
                for (const user of users) {
                    const userCreatedDate = moment(user.created_dt).tz('Asia/Tokyo').startOf('day')
                    const daysSinceCreation = currentLocalDate.diff(userCreatedDate, 'days')
                    if ([1, 3, 7, 14, 28].includes(daysSinceCreation)) {
                        await sgMailSend({
                            to: user.email,
                            id: process.env.SENDGRID_D_CARDREGISTER ?? '',
                            name: user.name,
                            cc: process.env.SUPPORT_MAIL ?? ''
                        })
                    }
                }
            }
        } catch (error) {
            logger.error('Card Not Registered :: ' + error)
        }
    },
    {
        scheduled: true,
        timezone: 'Asia/Tokyo'
    }
)

// Aggregate monthly usage
cron.schedule(
    '00 00 00 1 * *',
    async () => {
        try {
            const users = await User.find({
                isAdmin: false,
                deleted_dt: null
            })
            if (users.length) {
                for (const user of users) {
                    user.passedUsage = {
                        usage: user.usage,
                        limit: user.changedPlan ?? user.plan
                    }
                    user.usage = 0
                    user.changedPlan = null
                    if (user.status === 'canceling') {
                        if (user.canceled !== null && user.canceled < moment.tz('Asia/Tokyo').unix()) {
                            user.status = 'canceled'
                        }
                    }
                    user.save()
                }
            }
        } catch (error) {
            logger.error('Aggregate Usage :: ' + error)
        }
    },
    {
        scheduled: true,
        timezone: 'Asia/Tokyo'
    }
)

app.listen(expressPort, () => {
    logger.info('Server stated on port :: ' + expressPort)
})
