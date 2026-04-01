import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Добавляем токен к каждому запросу
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Автообновление токена если истёк
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh/`,
          { refresh }
        )
        localStorage.setItem('access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:       (data) => api.post('/auth/register/', data),
  login:          (data) => api.post('/auth/login/', data),
  logout:         (refresh) => api.post('/auth/logout/', { refresh }),
  me:             () => api.get('/auth/me/'),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

// ── Кандидат ──────────────────────────────────────────────────────────────────
export const candidateApi = {
  get:    ()     => api.get('/me/'),
  create: (data) => api.post('/me/', data),
  update: (data) => api.patch('/me/', data),
  submit: ()     => api.post('/me/submit/'),
}

// ── Комиссия ──────────────────────────────────────────────────────────────────
export const adminApi = {
  stats:        ()           => api.get('/admin/stats/'),
  candidates:   (params)     => api.get('/admin/candidates/', { params }),
  candidate:    (id)         => api.get(`/admin/candidates/${id}/`),
  updateStatus: (id, status) => api.post(`/admin/candidates/${id}/status/`, { status }),
  rescore:      (id)         => api.post(`/admin/candidates/${id}/rescore/`),
}

export default api
