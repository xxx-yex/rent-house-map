import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
      return Promise.reject(err)
    }
    const msg = err.response?.data?.error || err.message || '网络请求失败'
    console.error(msg)
    import('../composables/useToast').then(m => m.useToast().show(msg, 'error'))
    return Promise.reject(err)
  }
)

export default api
