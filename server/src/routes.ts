import { Router } from 'express'
import { Register, Login, getResetToken, resetPassword } from './controller/auth.controller'
import { getRules, createRule, updateRule, cloneRule, deleteRule } from './controller/rule.controller'
import { auth, authToken } from './middleware/auth.middleware'
import { getUsers, createUser, getUser, updateUser } from './controller/user.controller'
import { createSubscription, updateCard, cancalSubscription, updateSubscription, handleHook } from './controller/stripe.controller'

export const routes = (router: any) => {
    router.post('/api/register', Register)
    router.post('/api/login', Login)
    router.post('/api/getResetToken', getResetToken)
    router.post('/api/resetPassword', resetPassword)
    router.post('/api/authToken', authToken)
}

export const authroutes = (router: any) => {
    // rules api
    router.get('/api/getRules/:id', auth, getRules)
    router.post('/api/createRule', auth, createRule)
    router.put('/api/updateRule', auth, updateRule)
    router.post('/api/cloneRule', auth, cloneRule)
    router.delete('/api/deleteRule/:id', auth, deleteRule)

    // user api
    router.get('/api/getUsers', auth, getUsers)
    router.post('/api/createUser', auth, createUser)
    router.get('/api/getUser/:id', auth, getUser)
    router.put('/api/updateUser', auth, updateUser)

    // stripe api
    router.post('/api/createSubscription', createSubscription)
    router.post('/api/updateSubscription', updateSubscription)
    router.post('/api/updateCard', updateCard)
    router.post('/api/cancalSubscription', cancalSubscription)
    router.post('/api/web-hook', handleHook)
}
