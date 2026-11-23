require('dotenv').config()

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'
const SECRET = process.env.SECRET

if (process.env.NODE_ENV === 'test' && !MONGODB_URI) {
  throw new Error('TEST_MONGODB_URI must be set when running tests')
}

if (!SECRET) {
  throw new Error('SECRET must be set to sign authentication tokens')
}

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
}
