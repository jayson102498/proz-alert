import { Request, Response } from 'express'
import { SALT_OR_ROUNDS } from '../constant/constants'
import User from '../model/user.model'
import bcrypt, { hash } from 'bcrypt'
import { getUserIdByToken, tokenGenerate } from '../util/token.util'
import { sgMailSend } from '../util/sendgrid.util'
import logger from '../util/logger'

export const Register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, plan } = req.body
        const exist = await User.findOne({ email: email, deleted_dt: null })
        if (exist) {
            return res.status(400).send({
                message: '既に登録済みのユーザーです。'
            })
        }
        const hashPassword = await hash(password, SALT_OR_ROUNDS)
        const pmail = process.env.MAIL_USER

        await sgMailSend({
            to: email,
            id: process.env.SENDGRID_D_REGISTERD ?? '',
            name: name,
            cc: process.env.SUPPORT_MAIL ?? ''
        })

        const user = await User.create({
            name,
            email,
            pmail,
            password: hashPassword,
            plan
        })

        return res.status(200).send({
            message: 'ユーザー登録に成功しました。',
            user: user
        })
    } catch (error: any) {
        logger.error(error)
        if (error.message !== 'メールを送信できません。') {
            return res.status(500).send({
                message: '内部サーバーエラー！'
            })
        }
    }
}

export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email: email, deleted_dt: null })
        if (!user) {
            return res.status(400).send({
                message: '未登録のユーザーです。'
            })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).send({
                message: 'パスワードを再確認してください。'
            })
        }

        const token = tokenGenerate(user.id)

        return res.status(200).send({
            message: 'ログインに成功しました！',
            user: user,
            token: token
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const getResetToken = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email: email, deleted_dt: null })
        if (!user) {
            return res.status(400).send({
                message: '未登録のユーザーです。'
            })
        }

        const token = tokenGenerate(user.id)
        await sgMailSend({
            to: email,
            id: process.env.SENDGRID_D_CHANGE_PASSWORD ?? '',
            link: token
        })
        return res.status(200).send({
            token: token
        })
    } catch (error: any) {
        logger.error(error)
        if (error.message === 'メールを送信できません。') {
            return res.status(400).send({
                message: 'メールを送信できません。'
            })
        }
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body
    try {
        const userId = await getUserIdByToken(token)
        if (!userId) {
            return res.status(401).send({
                message: 'ユーザーが見つかりません！'
            })
        }

        const user = await User.findById(userId).orFail()
        user.password = await hash(password, SALT_OR_ROUNDS)
        user.updated_dt = new Date()
        await user.save()

        return res.status(200).send({
            message: 'ok'
        })
    } catch (error: any) {
        logger.error(error)
        return res.status(500).send({
            message: error.message ?? '内部サーバーエラー！'
        })
    }
}
