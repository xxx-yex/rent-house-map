import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  res => res.data,
  err => {
    console.error(err.response?.data?.error || err.message)
    return Promise.reject(err)
  }
)

export default api
