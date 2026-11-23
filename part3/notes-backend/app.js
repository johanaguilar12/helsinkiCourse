require('dotenv').config()

const express = require('express')
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured')
}

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.get('/', (_request, response) => {
  response.send('<h1>Notes</h1>')
})

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
