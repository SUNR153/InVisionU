import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { auth } from '../store/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '', password2: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Простая валидация на фронте
    const errs = {}
    if (!form.email) errs.email = 'Введи email'
    if (form.password.length < 8) errs.password = 'Минимум 8 символов'
    if (form.password !== form.password2) errs.password2 = 'Пароли не совпадают'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      auth.setTokens(data)
      navigate('/form')
    } catch (err) {
      const data = err.response?.data || {}
      // Показываем ошибки с бэка
      const mapped = {}
      Object.entries(data).forEach(([key, val]) => {
        mapped[key] = Array.isArray(val) ? val[0] : val
      })
      setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            inVision<span style={{ color: 'var(--green)' }}>U</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Создай аккаунт</div>
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
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              name="password"
              type="password"
              placeholder="минимум 8 символов"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div>
            <label className="label">Повтори пароль</label>
            <input
              name="password2"
              type="password"
              placeholder="ещё раз"
              value={form.password2}
              onChange={handleChange}
            />
            {errors.password2 && <div className="error-text">{errors.password2}</div>}
          </div>

          {errors.non_field_errors && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--red-light, #FCEBEB)',
              color: 'var(--red)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
            }}>
              {errors.non_field_errors}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }}
          >
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  )
}
