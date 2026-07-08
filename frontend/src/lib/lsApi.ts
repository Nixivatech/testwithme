import axios from 'axios'

const LS_TOKEN_KEY = 'ls_token'

export const lsApi = axios.create({
  baseURL: import.meta.env.VITE_LS_API_URL ?? 'http://localhost:5020',
})

lsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(LS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getLsToken() {
  return localStorage.getItem(LS_TOKEN_KEY)
}

export function setLsToken(token: string) {
  localStorage.setItem(LS_TOKEN_KEY, token)
}

export function clearLsToken() {
  localStorage.removeItem(LS_TOKEN_KEY)
}
