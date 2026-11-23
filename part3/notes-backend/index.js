require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')
const User = require('./models/user')
const Note = require('./models/note')

const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('A MongoDB URI must be configured for this environment')
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured')
}

const start = async () => {
  await mongoose.connect(MONGODB_URI)
  await Promise.all([User.init(), Note.init()])
  console.log('Connected to MongoDB')

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exitCode = 1
})
