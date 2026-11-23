const jwt = require('jsonwebtoken')
const User = require('../models/user')

const unknownEndpoint = (_request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }

  next(error)
}

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(
      authorization.slice(7),
      process.env.JWT_SECRET
    )
  } catch (_error) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  request.user = user
  next()
}

module.exports = {
  errorHandler,
  unknownEndpoint,
  userExtractor,
}
