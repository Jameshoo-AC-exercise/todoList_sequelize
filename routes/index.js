const express = require('express')
const router = express.Router()

const todos = require('./modules/todos')
const users = require('./modules/users')
const home = require('./modules/home')
const { authenticator } = require('../middleware/auth')

router.use('/todos', authenticator, todos)
router.use('/users', users)
router.use('/', authenticator, home)

module.exports = router
