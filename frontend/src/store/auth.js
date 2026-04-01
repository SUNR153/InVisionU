// store/auth.js — работа с токенами и состоянием авторизации

export const auth = {
  // Сохранить токены после логина/регистрации
  setTokens({ access, refresh, is_staff }) {
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    if (is_staff !== undefined) {
      localStorage.setItem('is_staff', is_staff ? '1' : '0')
    }
  },

  // Удалить токены при логауте
  clear() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('is_staff')
  },

  // Проверить авторизован ли пользователь
  isLoggedIn() {
    return !!localStorage.getItem('access')
  },

  // Является ли staff (комиссия)
  isStaff() {
    return localStorage.getItem('is_staff') === '1'
  },

  getAccess()  { return localStorage.getItem('access') },
  getRefresh() { return localStorage.getItem('refresh') },
}
