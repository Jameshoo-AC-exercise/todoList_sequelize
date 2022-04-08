const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const routes = require('./routes')
const usePassport = require('./config/passport')
const flash = require('connect-flash')

// dotenv start
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// server start
const app = express()
const PORT = process.env.PORT || 3000

// session start
app.use(
  session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
  })
)

// passport start
usePassport(app)

// handlebars start
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

// app usage
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(flash())
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  console.log('res.locals.success_msg' + res.locals.success_msg)
  console.log('res.locals.warning_msg' + res.locals.warning_msg)
  next()
})
// routes
app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
