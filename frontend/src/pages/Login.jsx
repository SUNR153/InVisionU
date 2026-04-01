import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { auth } from '../store/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Заполни все поля'); return }

    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      auth.setTokens(data)
      // Если staff — в дашборд, если кандидат — в кабинет
      navigate(data.is_staff ? '/dashboard' : '/cabinet')
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            inVision<span style={{ color: 'var(--green)' }}>U</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Войти в аккаунт</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              placeholder="твой@email.com"
              value={form.email}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: '#FCEBEB',
              color: 'var(--red)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15 }}
          >
            {loading ? 'Входим...' : 'Войти →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
