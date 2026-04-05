import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/client'
import { auth } from '../store/auth'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    password: '', 
    password2: '', 
    program: '', 
    agreed: false 
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ 
      ...f, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    setErrors(err => ({ ...err, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errs = {}
    if (!form.full_name) errs.full_name = t('errFullName')
    if (!form.email) errs.email = t('errEmail')
    if (form.password.length < 8) errs.password = t('errPasswordShort')
    if (form.password !== form.password2) errs.password2 = t('errPasswordMatch')
    if (!form.program) errs.program = t('errSelectProgram')
    if (!form.agreed) errs.agreed = t('errAgreement')

    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      auth.setTokens(data)
      navigate('/form')
    } catch (err) {
      const data = err.response?.data || {}
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
        maxWidth: '450px' 
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
            inVision<span style={{ color: '#d4f08d' }}>U</span>
          </div>
          <div style={{ fontSize: 15, color: '#6b7280', fontWeight: 500 }}>{t('createAccount')}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('labelFullName')}</label>
            <input
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
              name="full_name"
              type="text"
              placeholder={t('placeholderFullName')}
              value={form.full_name}
              onChange={handleChange}
            />
            {errors.full_name && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.full_name}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
            <input
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('labelPassword')}</label>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
                name="password"
                type="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('labelConfirmPassword')}</label>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
                name="password2"
                type="password"
                placeholder="********"
                value={form.password2}
                onChange={handleChange}
              />
            </div>
          </div>
          {(errors.password || errors.password2) && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-10px' }}>{errors.password || errors.passwordMatch}</div>}

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('labelSelectProgram')}</label>
            <select 
              name="program" 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', outline: 'none', fontSize: '14px', cursor: 'pointer' }}
              value={form.program} 
              onChange={handleChange}
            >
              <option value="">{t('choose')}</option>
              <option value="foundation">Foundation</option>
              <option value="bachelor">Bachelor</option>
            </select>
            {errors.program && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.program}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 5 }}>
            <input
              name="agreed"
              type="checkbox"
              id="agreed"
              checked={form.agreed}
              onChange={handleChange}
              style={{ marginTop: 4, width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="agreed" style={{ fontSize: 13, color: '#4b5563', lineHeight: '1.5' }}>
              {t('userAgreementText')} <Link to="/terms" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>{t('userAgreementLink')}</Link>
            </label>
          </div>
          {errors.agreed && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-10px' }}>{errors.agreed}</div>}

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
              border: 'none'
            }}
          >
            {loading ? t('loading') : `${t('registerBtnText').toUpperCase()} →`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
          {t('alreadyHaveAccount')} <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>{t('loginLink')}</Link>
        </p>
      </div>
    </div>
  ) 
}