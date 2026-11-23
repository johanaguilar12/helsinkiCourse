import axios from 'axios'

const baseUrl = '/api/notes'
let token = null

const authConfig = () => token
  ? { headers: { Authorization: `Bearer ${token}` } }
  : {}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject, authConfig())
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject, authConfig())
  return request.then(response => response.data)
}

const setToken = newToken => {
  token = newToken
}

export default { getAll, create, update, setToken }
