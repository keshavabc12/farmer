import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Auto-attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const loginUser    = (data) => api.post('/auth/login', data)
export const registerUser = (data) => api.post('/auth/register', data)
export const getMe        = ()     => api.get('/auth/me')

// Farmers
export const fetchStats   = ()          => api.get('/farmers/stats')
export const fetchFarmers = (params)    => api.get('/farmers', { params })
export const fetchFarmer  = (id)        => api.get(`/farmers/${id}`)
export const createFarmer = (data)      => api.post('/farmers', data)
export const updateFarmer = (id, data)  => api.put(`/farmers/${id}`, data)
export const deleteFarmer = (id)        => api.delete(`/farmers/${id}`)

export default api
