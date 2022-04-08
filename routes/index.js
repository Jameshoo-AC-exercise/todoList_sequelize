const express = require('express')
const router = express.Router()

const todos = require('./modules/todos')
const users = require('./modules/users')
const auth = require('./modules/auth')
const home = require('./modules/home')
const { authenticator } = require('../middleware/auth')

router.use('/todos', authenticator, todos)
router.use('/users', users)
router.use('/auth', auth)
router.use('/', authenticator, home)

module.exports = router
