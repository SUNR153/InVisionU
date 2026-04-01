import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'
import { authApi } from '../api/client'

const NAV = [
  { path: '/candidates', label: 'Все кандидаты', icon: '👥' },
  { path: '/shortlist',  label: 'Шортлист',       icon: '⭐' },
  { path: '/flagged',    label: 'AI-флаги',         icon: '⚠️' },
  { path: '/stats',      label: 'Статистика',       icon: '📊' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    try { await authApi.logout(auth.getRefresh()) } catch {}
    auth.clear()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--white)',
      borderRight: '1.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Лого */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--green-400)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 700, color: '#fff',
          }}>U</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>inVision<span style={{ color: 'var(--green-400)' }}>U</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Панель комиссии</div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? 'var(--green-50)' : 'transparent',
                color: active ? 'var(--green-800)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Выход */}
      <div style={{ padding: '12px 10px', borderTop: '1.5px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🚪</span> Выйти
        </button>
      </div>
    </aside>
  )
}
