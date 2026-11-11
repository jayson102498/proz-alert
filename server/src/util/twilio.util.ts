import twilio from 'twilio'
import dotenv from 'dotenv'
import logger from './logger'

dotenv.config()

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
    process.env

if (!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER)) {
    throw new Error('Twilio credentials are not defined!')
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

export const sendSMS = async (to: string, message: string) => {
    try {
        return await client.messages.create({
            to,
            from: TWILIO_PHONE_NUMBER,
            body: message
        })
    } catch (error) {
        logger.error(error)
    }
}

export const Call = async (to: string, message: string) => {
    try {
        return await client.calls.create({
            to,
            from: TWILIO_PHONE_NUMBER,
            twiml:
                '<Response><Say language="ja-Ja" voice="Polly.Mizuki">' +
                message +
                '</Say></Response>'
        })
    } catch (error) {
        logger.error(error)
    }
}
