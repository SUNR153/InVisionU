import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'
import { authApi } from '../api/client'

const NAV = [
  { path: '/candidates', label: 'Все кандидаты', icon: '👥' },
  { path: '/shortlist',  label: 'Шортлист',       icon: '⭐' },
  { path: '/flagged',    label: 'AI-флаги',         icon: '⚠️' },
  { path: '/stats',      label: 'Статистика',       icon: '📊' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    try { await authApi.logout(auth.getRefresh()) } catch {}
    auth.clear()
    navigate('/login')
  }

  const navItems = (
    <>
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {NAV.map(item => {
          const active = pathname === item.path || (item.path === '/candidates' && pathname.startsWith('/candidates'))
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? 'var(--green-50)' : 'transparent',
                color: active ? 'var(--green-800)' : 'var(--muted)',
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1.5px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>🚪</span> Выйти
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside style={{
        width: 220, flexShrink: 0, minHeight: '100vh',
        background: 'var(--white)',
        borderRight: '1.5px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }} className="sidebar-desktop">
        <div style={{ padding: '18px 20px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700 }}>U</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>inVision<span style={{ color: 'var(--green)' }}>U</span></div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Панель комиссии</div>
          </div>
        </div>
        {navItems}
      </aside>

      <div className="mobile-header" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--white)', borderBottom: '1.5px solid var(--border)',
        padding: '12px 16px',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>U</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>inVision<span style={{ color: 'var(--green)' }}>U</span></div>
        </div>
        <button onClick={() => setOpen(!open)} style={{
          background: 'transparent', border: 'none', padding: 6,
          cursor: 'pointer', fontSize: 20, color: 'var(--text)',
        }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{
          position: 'fixed', top: 57, left: 0, right: 0, bottom: 0, zIndex: 199,
          background: 'var(--white)',
          display: 'flex', flexDirection: 'column',
          borderTop: '1.5px solid var(--border)',
        }} className="mobile-menu">
          {navItems}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </>
  )
}
