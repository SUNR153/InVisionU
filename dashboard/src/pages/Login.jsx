import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { auth } from '../store/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    console.log('Отправляем:', form)
    try {
      const { data } = await authApi.login(form)
      console.log('Ответ:', data)
      if (!data.is_staff) {
        setError('Доступ только для приёмной комиссии.')
        return
      }
      auth.setTokens(data)
      navigate('/candidates')
    } catch (err) {
      console.log('Ошибка:', err)
      setError('Неверный email или пароль.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--green-50), var(--bg))', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 14px' }}>U</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Панель комиссии</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>inVision University</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-800)', marginBottom: 6 }}>Email</div>
              <input type="email" placeholder="admin@invisionu.kz" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ width: '100%' }} autoFocus />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-800)', marginBottom: 6 }}>Пароль</div>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%' }} />
            </div>
            {error && (
              <div style={{ padding: '9px 12px', background: '#FCEBEB', color: '#E24B4A', borderRadius: 7, fontSize: 13 }}>
                {error}
              </div>
            )}
            <button onClick={handleSubmit} className="btn-green" disabled={loading}
              style={{ width: '100%', padding: 11, fontSize: 14, borderRadius: 8, marginTop: 4 }}>
              {loading ? 'Входим...' : 'Войти в панель →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}