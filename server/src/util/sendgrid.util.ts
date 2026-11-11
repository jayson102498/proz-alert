import sgMail, { MailDataRequired } from '@sendgrid/mail'
import logger from './logger'
import dotenv from 'dotenv'
dotenv.config()

const { SENDGRID_API_KEY, SUPPORT_MAIL } = process.env
sgMail.setApiKey(SENDGRID_API_KEY ?? '')

interface sgMailProps {
    to: string
    cc?: string
    id: string
    name?: string
    link?: string
    date?: string
    plan?: string
}

export const sgMailSend = async ({
    to,
    cc,
    id,
    name,
    link,
    date,
    plan
}: sgMailProps) => {
    const message: MailDataRequired = {
        to: to,
        from: {
            name: 'Prozアラート',
            email: SUPPORT_MAIL ?? 'info@prozalert.jp'
        },
        templateId: id,
        dynamicTemplateData: {
            name: name,
            link: link,
            date: date,
            plan: plan
        }
    }
    if (cc) {
        message.cc = cc
    }
    try {
        await sgMail.send(message)
    } catch (error: any) {
        logger.error(error)
        if (error.response) {
            logger.error(error.response.body)
        }
        throw new Error('メールを送信できません。')
    }
}

export const sendDirectMessage = async ({
    to,
    content
}: {
    to: string
    content: string
}) => {
    const message: MailDataRequired = {
        to,
        from: {
            name: 'Prozアラート',
            email: SUPPORT_MAIL || 'info@prozalert.jp'
        },
        subject: 'テストメール',
        text: content
    }

    try {
        await sgMail.send(message)
    } catch (error: any) {
        logger.error('Error sending email:' + error)
        if (error.response) {
            logger.error('SendGrid error response: ' + error.response.body)
        }
        throw new Error('Failed to send email.')
    }
}
