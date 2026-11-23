require('dotenv').config({ quiet: true })

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const connectToDatabase = require('./utils/db')

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

morgan.token('body', request =>
  request.method === 'POST' ? JSON.stringify(request.body) : ''
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', async (request, response) => {
  const persons = await Person.find({})
  response.json(persons)
})

app.get('/info', async (request, response) => {
  const count = await Person.countDocuments({})
  const timestamp = new Date().toString()
  response.send(
    `<p>Phonebook has info for ${count} people</p><p>${timestamp}</p>`
  )
})

app.get('/api/persons/:id', async (request, response) => {
  const person = await Person.findById(request.params.id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', async (request, response) => {
  await Person.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

app.post('/api/persons', async (request, response) => {
  const body = request.body

  if (
    typeof body?.name !== 'string' ||
    typeof body?.number !== 'string' ||
    !body.name.trim() ||
    !body.number.trim()
  ) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  const person = new Person({
    name: body.name.trim(),
    number: body.number.trim(),
  })

  const savedPerson = await person.save()
  response.status(201).json(savedPerson)
})

app.put('/api/persons/:id', async (request, response) => {
  const body = request.body

  if (
    typeof body?.name !== 'string' ||
    typeof body?.number !== 'string' ||
    !body.name.trim() ||
    !body.number.trim()
  ) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  const person = await Person.findByIdAndUpdate(
    request.params.id,
    {
      name: body.name.trim(),
      number: body.number.trim(),
    },
    { new: true, runValidators: true }
  )

  if (!person) {
    return response.status(404).end()
  }

  response.json(person)
})

app.use((request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const start = async () => {
  await connectToDatabase()

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch(error => {
  console.error('Failed to start server:', error.message)
  process.exitCode = 1
})
