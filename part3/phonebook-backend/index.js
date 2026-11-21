const express = require('express')
const morgan = require('morgan')

const app = express()

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.use(express.json())

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

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const timestamp = new Date().toString()
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p>`
  )
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => Math.floor(Math.random() * 1000000000)

app.post('/api/persons', (request, response) => {
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

  const normalizedName = body.name.trim()
  const nameExists = persons.some(
    person => person.name.toLowerCase() === normalizedName.toLowerCase()
  )

  if (nameExists) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  }

  const person = {
    id: generateId(),
    name: normalizedName,
    number: body.number.trim(),
  }

  persons = persons.concat(person)
  response.status(201).json(person)
})

app.use((request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
