import { NextFunction, Request, Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import { tokenGenerate } from '../util/token.util'
import User from '../model/user.model'
import dotenv from 'dotenv'
import logger from '../util/logger'

dotenv.config()

if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT secret keyが定義されていない！')
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.header('x-auth-koken')

    if (!token) {
        return res.status(401).send({
            message: '認証に失敗した！'
        })
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY as Secret, {
            ignoreExpiration: false
        })
        next()
    } catch (error) {
        logger.error(error)
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send({
                message: 'トークンの有効期限が切れました！'
            })
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send({
                message: '無効なトークン！'
            })
        }

        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const authToken = (req: Request, res: Response) => {
    const { token, userId } = req.body
    if (!token) {
        return res.status(401).send({
            message: '認証に失敗した！'
        })
    }

    try {
        const user = User.findById(userId)
        if (!user) {
            return res.status(400).send({
                message: 'failed'
            })
        }
        jwt.verify(token, process.env.JWT_SECRET_KEY as Secret, {
            ignoreExpiration: false
        })
        const refreshToken = tokenGenerate(userId)
        return res.status(200).send({
            token: refreshToken
        })
    } catch (error) {
        logger.error(error)
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send({
                message: 'トークンの有効期限が切れました！'
            })
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send({
                message: '無効なトークン！'
            })
        }

        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}
