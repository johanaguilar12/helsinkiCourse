const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body || {}

  if (typeof username !== 'string' || typeof password !== 'string') {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() })
  const passwordCorrect = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!user || !passwordCorrect) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const token = jwt.sign(
    { username: user.username, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  response.json({
    token,
    id: user.id,
    username: user.username,
    name: user.name,
  })
})

module.exports = loginRouter
