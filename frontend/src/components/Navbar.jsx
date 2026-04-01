import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'
import { authApi } from '../api/client'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = auth.isLoggedIn()

  async function handleLogout() {
    try {
      await authApi.logout(auth.getRefresh())
    } catch {}
    auth.clear()
    navigate('/login')
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      background: '#fff',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link to="/" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
        inVision<span style={{ color: 'var(--green)' }}>U</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {loggedIn ? (
          <>
            <Link to="/cabinet" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Мой кабинет
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Войти
            </Link>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                Подать заявку
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
