import axios from 'axios'

const getAll = () => axios
  .get('/api/users')
  .then(response => response.data)

const create = newUser => axios
  .post('/api/users', newUser)
  .then(response => response.data)

const login = credentials => axios
  .post('/api/login', credentials)
  .then(response => response.data)

export default { getAll, create, login }
