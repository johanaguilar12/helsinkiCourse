const mongoose = require('mongoose')

const connectToDatabase = async () => {
  const { MONGODB_URI, MONGODB_USERNAME, MONGODB_PASSWORD } = process.env

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  const uri = new URL(MONGODB_URI)

  if (MONGODB_USERNAME) {
    uri.username = MONGODB_USERNAME
  }

  if (MONGODB_PASSWORD) {
    uri.password = MONGODB_PASSWORD
  }

  await mongoose.connect(uri.toString())
  console.log('Connected to MongoDB')
}

module.exports = connectToDatabase
