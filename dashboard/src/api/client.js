import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        if (!refresh) throw new Error('no refresh')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh/`, { refresh }
        )
        localStorage.setItem('access', data.access)
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login:  data => api.post('/auth/login/', data),
  logout: refresh => api.post('/auth/logout/', { refresh }),
  me:     () => api.get('/auth/me/'),
}

export const adminApi = {
  stats:        ()           => api.get('/admin/stats/'),
  candidates:   (params)     => api.get('/admin/candidates/', { params }),
  candidate:    id           => api.get(`/admin/candidates/${id}/`),
  updateStatus: (id, status) => api.post(`/admin/candidates/${id}/status/`, { status }),
  rescore:      id           => api.post(`/admin/candidates/${id}/rescore/`),
  comments:     id           => api.get(`/admin/candidates/${id}/comments/`),
  addComment:   (id, text)   => api.post(`/admin/candidates/${id}/comments/`, { text }),
  log:          ()           => api.get('/admin/log/'),
}

export default api