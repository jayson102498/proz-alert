import { Request, Response } from 'express'
import Rule from '../model/rule.model'
import logger from '../util/logger'

export const getRules = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const rules = await Rule.find({ uid: id, deleted_dt: null })

        return res.status(200).send({
            rules: rules
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const createRule = async (req: Request, res: Response) => {
    try {
        const { uid, name, conditions, setting, phones, notif } = req.body
        const exist = await Rule.findOne({ uid: uid, name: name })
        if (exist) {
            return res
                .status(400)
                .json({ message: '同名のルールが既に存在します。' })
        }
        const rule = await Rule.create({
            uid,
            name,
            conditions,
            setting,
            phones,
            notif
        })
        return res.status(200).json({ rule })
    } catch (error) {
        logger.error(error)
        return res.status(500).json({ message: '内部サーバーエラー！' })
    }
}

export const updateRule = async (req: Request, res: Response) => {
    try {
        const { id, uid, name, conditions, setting, phones, notif } = req.body

        const existingRule = await Rule.findOne({ uid, name })
        if (existingRule && (existingRule._id as any).toString() !== id) {
            return res
                .status(400)
                .json({ message: '同名のルールが既に存在します。' })
        }

        const rule = await Rule.findById(id).orFail(
            new Error('指定のルールが見つかりません。')
        )

        rule.name = name
        rule.notif = notif
        rule.phones = phones
        rule.conditions = conditions
        rule.setting = setting
        await rule.save()

        return res.status(200).json({ rule })
    } catch (error) {
        logger.error(error)
        return res.status(500).json({
            message: '内部サーバーエラー！'
        })
    }
}

export const cloneRule = async (req: Request, res: Response) => {
    try {
        const { uid, name, conditions, setting, phones, notif } = req.body
        const exist = await Rule.findOne({ uid: uid, name: name })
        if (exist) {
            return res
                .status(400)
                .json({ message: '同名のルールが既に存在します。' })
        }
        const rule = await Rule.create({
            uid,
            name,
            conditions,
            setting,
            phones,
            notif
        })
        return res.status(200).json({ rule })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}

export const deleteRule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await Rule.deleteOne({ _id: id }).orFail()
        return res.status(200).send({
            message: '削除されました。'
        })
    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            message: '内部サーバーエラー！'
        })
    }
}
