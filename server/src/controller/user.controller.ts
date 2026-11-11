import { Request, Response } from 'express'
import { SALT_OR_ROUNDS } from '../constant/constants'
import User from '../model/user.model'
import { hash } from 'bcrypt'
import { sgMailSend } from '../util/sendgrid.util'
import logger from '../util/logger'

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({
            isAdmin: false,
            deleted_dt: null
        }).sort({ created_dt: -1 })
        return res.status(200).send({
            users: users
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, plan, card } = req.body
        const exist = await User.findOne({ email: email, deleted_dt: null })
        if (exist) {
            return res.status(400).send({
                message: '既に登録済みのユーザーです。'
            })
        }
        const hashPassword = await hash('prozalert1234', SALT_OR_ROUNDS)
        const pmail = process.env.MAIL_USER
        const user = await User.create({
            name,
            email,
            pmail,
            password: hashPassword,
            plan,
            card: card === 'カード' ? null : card,
            status: card === 'カード' ? null : 'active'
        })
        await sgMailSend({
            to: email,
            id: process.env.SENDGRID_D_REGISTERD ?? '',
            name: name,
            cc: process.env.SUPPORT_MAIL ?? ''
        })
        return res.status(200).send({
            message: 'ユーザー登録に成功しました。',
            user: user
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user)
            return res.status(400).send({
                message: '指定のユーザーが見つかりません。'
            })
        return res.status(200).send({
            user: user
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id, name, email, card } = req.body
        const exist = await User.findOne({ email: email, deleted_dt: null })
        if (exist && (exist as any)._id.toString() !== id) {
            return res.status(400).send({
                message: '既に登録済みのユーザーです。'
            })
        }
        const user = await User.findById(id).orFail()
        user.name = name
        user.email = email
        if (card === '銀行振込') {
            user.card = card
            user.status = 'active'
        } else {
            user.card = user.card !== '銀行振込' ? user.card : null
        }
        await user.save()
        return res.status(200).send({
            user: user
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const updateUsage = async (userId: string) => {
    try {
        const user = await User.findById(userId)
        if (user) {
            user.usage = user.usage + 1
            await user.save()
        }
    } catch (error) {
        logger.error(error)
    }
}
