const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('./config')

const requestLogger = (request, _response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  const body = request.body ? { ...request.body } : request.body
  if (body) {
    delete body.password
    delete body.passwordHash
  }
  logger.info('Body:  ', body)
  logger.info('---')
  next()
}

const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, _request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }

  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  }

  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

const tokenExtractor = (request, _response, next) => {
  const authorization = request.get('authorization')
  request.token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken

  try {
    decodedToken = jwt.verify(request.token, config.SECRET)
  } catch (error) {
    return next(error)
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (!user) {
    return response.status(401).json({ error: 'token user not found' })
  }

  request.user = user
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
