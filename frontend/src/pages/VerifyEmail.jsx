import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/client'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); return }

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--green-50), var(--bg))', padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Проверяем токен...</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Email подтверждён!</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
              Теперь можешь заполнить анкету и отправить заявку.
            </div>
            <button className="btn-green" style={{ padding: '10px 24px', fontSize: 14, borderRadius: 8 }}
              onClick={() => navigate('/cabinet')}>
              Перейти в кабинет →
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Неверная ссылка</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
              Ссылка недействительна или уже использована.
            </div>
            <button className="btn-ghost" style={{ padding: '10px 24px', fontSize: 14, borderRadius: 8 }}
              onClick={() => navigate('/cabinet')}>
              В кабинет
            </button>
          </>
        )}
      </div>
    </div>
  )
}