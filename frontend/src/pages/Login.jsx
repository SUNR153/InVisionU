import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/client'
import { auth } from '../store/auth'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(err => ({ ...err, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    const errs = {}
    if (!form.email) errs.email = t('errEmail')
    if (!form.password) errs.password = t('errPasswordShort')

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      auth.setTokens(data)
      navigate('/form')
    } catch (err) {
      setErrors({ detail: err.response?.data?.detail || 'Қате: Email немесе құпия сөз дұрыс емес' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#d4f08d', 
      padding: '20px' 
    }}>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '420px' 
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
            inVision<span style={{ color: '#d4f08d' }}>U</span>
          </div>
          <div style={{ fontSize: 15, color: '#6b7280', fontWeight: 500 }}>
            {t('loginHeader') || 'Войти в аккаунт'}
          </div>
        </div>

        {errors.detail && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
            {errors.detail}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email</label>
            <input
              style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errors.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              {t('labelPassword')}
            </label>
            <input
              style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}
              name="password"
              type="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errors.password}</div>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              backgroundColor: 'black', 
              color: 'white', 
              padding: '16px', 
              borderRadius: '10px', 
              fontWeight: 700, 
              fontSize: '16px', 
              marginTop: '10px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? t('loading') : `${t('loginBtnText')?.toUpperCase() || 'ВОЙТИ'} →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 30, fontSize: 14, color: '#6b7280' }}>
          {t('noAccount') || 'Нет аккаунта?'} <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>{t('registerLink') || 'Зарегистрироваться'}</Link>
        </p>
      </div>
    </div>
  )
}