const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body || {}

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.trim().length < 3 ||
    password.length < 3 ||
    (name !== undefined && (typeof name !== 'string' || !name.trim()))
  ) {
    return response.status(400).json({
      error: 'username and password must be at least 3 characters',
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({
    username: username.trim(),
    name: typeof name === 'string' ? name.trim() : username.trim(),
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
