const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')

const db = require('../models')
const User = db.User

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } })
          if (!user)
            return done(null, false, {
              type: 'warning_msg',
              message: `帳號 ${email} 還未注冊!`,
            })
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch)
            return done(null, false, {
              type: 'warning_msg',
              message: `帳號 ${email} 或密碼錯誤！`,
            })
          return done(null, user)
        } catch (err) {
          console.log(err)
        }
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRECT,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { name, email } = profile._json
          let user = await User.findOne({ where: { email } })
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(randomPassword, salt)
          // for new user creation
          user = await User.create({
            name,
            email,
            password: hash,
          })
          return done(null, user)
        } catch (err) {
          return done(null, false)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then(user => {
        user = user.toJSON() // 由於這筆 User 物件常常會透過 req.user 傳到前端樣板，這裡要先轉成 plain object。
        done(null, user)
      })
      .catch(err => done(err, null))
  })
}
