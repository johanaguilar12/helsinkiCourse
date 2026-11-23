const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (_request, response) => {
  const users = await User.find({})
    .populate('notes', { content: 1, important: 1 })

  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body || {}

  if (
    typeof username !== 'string' ||
    typeof name !== 'string' ||
    typeof password !== 'string' ||
    username.trim().length < 3 ||
    !name.trim() ||
    password.length < 3
  ) {
    return response.status(400).json({
      error: 'username and password must be at least 3 characters, and name is required',
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({
    username: username.trim(),
    name: name.trim(),
    passwordHash,
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
