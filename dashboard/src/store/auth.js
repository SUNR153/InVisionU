export const auth = {
  setTokens({ access, refresh, is_staff }) {
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    if (is_staff !== undefined) localStorage.setItem('is_staff', is_staff ? '1' : '0')
  },
  clear() {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('is_staff')
  },
  isLoggedIn: () => !!localStorage.getItem('access'),
  isStaff:    () => localStorage.getItem('is_staff') === '1',
  getAccess:  () => localStorage.getItem('access'),
  getRefresh: () => localStorage.getItem('refresh'),
}