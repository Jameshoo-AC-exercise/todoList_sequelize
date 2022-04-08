const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('passport')

const app = express()
const PORT = 3000

const db = require('./models')
const Todo = db.Todo
const User = db.User

// 載入設定檔，要寫在 express-session 以後
const usePassport = require('./config/passport')

app.use(
  session({
    secret: 'ThisIsMySecret',
    resave: false,
    saveUninitialized: true,
  })
)
// 呼叫 Passport 函式並傳入 app，這條要寫在路由之前
usePassport(app)

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use((req, res, next) => {
  // 你可以在這裡 console.log(req.user) 等資訊來觀察
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})

app.get('/', (req, res) => {
  return Todo.findAll({
    raw: true,
    nest: true,
  })
    .then(todos => {
      return res.render('index', { todos })
    })
    .catch(error => {
      return res.status(422).json(error)
    })
})

app.get('/users/login', (req, res) => {
  res.render('login')
})

// 加入 middleware，驗證 reqest 登入狀態
app.post(
  '/users/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
  })
)

app.get('/users/register', (req, res) => {
  res.render('register')
})

app.post('/users/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  User.findOne({ where: { email } }).then(user => {
    if (user) {
      console.log('User already exists')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword,
      })
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash =>
        User.create({
          name,
          email,
          password: hash,
        })
      )
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
})

app.get('/users/logout', (req, res) => {
  res.send('logout')
})

app.get('/todos/new', (req, res) => {
  res.render('new')
})

app.post('/todos/new', async (req, res) => {
  const userId = req.user.id
  let { name, isDone } = req.body
  isDone = isDone === 'on'
  await Todo.create({ name, isDone, UserId: userId })
  res.redirect('/')
})

app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

app.get('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id)
    .then(todo => res.render('edit', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

app.put('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id
    let { name, isDone } = req.body
    isDone = isDone === 'on'
    await Todo.update({ name, isDone }, { where: { id } })
    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id
    await Todo.destroy({ where: { id } })
    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
