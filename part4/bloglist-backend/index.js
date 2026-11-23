const mongoose = require('mongoose')
const app = require('./app')
const Blog = require('./models/blog')
const User = require('./models/user')
const config = require('./utils/config')
const logger = require('./utils/logger')

mongoose.set('strictQuery', false)

const start = async () => {
  await mongoose.connect(config.MONGODB_URI)
  await Promise.all([Blog.init(), User.init()])
  logger.info('connected to MongoDB')

  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
  })
}

start().catch((error) => {
  logger.error('error connecting to MongoDB:', error.message)
  process.exitCode = 1
})
