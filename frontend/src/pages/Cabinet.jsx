import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { candidateApi } from '../api/client'

const CHECKLIST = [
  { key: 'motivation',  label: 'Мотивация заполнена' },
  { key: 'achievement', label: 'Достижения заполнены' },
  { key: 'problem',     label: 'Проблема описана' },
  { key: 'future',      label: 'Планы на 5 лет' },
  { key: 'essay',       label: 'Эссе написано' },
]

function scoreColor(v) {
  if (v >= 8) return { color: '#085041', bg: '#E1F5EE' }
  if (v >= 5) return { color: '#633806', bg: '#FAEEDA' }
  return { color: '#791F1F', bg: '#FCEBEB' }
}

export default function Cabinet() {
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    candidateApi.get()
      .then(({ data }) => setCandidate(data))
      .catch(() => navigate('/form'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (candidate?.status !== 'scoring') return
    const interval = setInterval(() => {
      candidateApi.get().then(({ data }) => {
        setCandidate(data)
        if (data.status !== 'scoring') clearInterval(interval)
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [candidate?.status])

  if (loading) return (
    <div><Navbar />
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Загружаем...</div>
    </div>
  )
  if (!candidate) return null

  const score = candidate.score
  const deadline = new Date('2025-04-05T23:59:00')
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / 86400000))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px' }}>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, padding: '20px 24px', flexWrap: 'wrap' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
            color: '#fff', fontSize: 20, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>{candidate.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{candidate.full_name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {candidate.school} · {candidate.city} · {candidate.email}
            </div>
          </div>
          <StatusBadge status={candidate.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-800)', marginBottom: 16 }}>Прогресс заявки</div>
            {CHECKLIST.map(item => {
              const done = candidate[item.key]?.trim()
              return (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: done ? 'var(--green-400)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ color: done ? 'var(--text)' : 'var(--text-muted)' }}>{item.label}</span>
                </div>
              )
            })}
            {candidate.status === 'new' && (
              <Link to="/form" style={{ display: 'block', marginTop: 16 }}>
                <button className="btn-primary" style={{ width: '100%', padding: 11 }}>
                  Продолжить анкету →
                </button>
              </Link>
            )}
            {candidate.status === 'scored' && candidate.submit_attempts < 3 && (
              <Link to="/form" style={{ display: 'block', marginTop: 16 }}>
                <button className="btn-primary" style={{ width: '100%', padding: 11 }}>
                  Перезаполнить и отправить снова →
                </button>
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Дедлайн</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>5 апреля, 23:59</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: daysLeft === 0 ? '#E24B4A' : 'var(--green-400)', lineHeight: 1 }}>{daysLeft}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{daysLeft === 0 ? 'сегодня!' : 'дней'}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Заполненность</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-600)', marginBottom: 10 }}>
                {candidate.completion_percent}%
              </div>
              <div style={{ height: 7, background: 'var(--border)', borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--green-400), var(--green-600))',
                  width: `${candidate.completion_percent}%`, transition: 'width 0.6s',
                }} />
              </div>
            </div>

            <div className="card" style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Подана</div>
              <div style={{ fontWeight: 600 }}>
                {new Date(candidate.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="card" style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Попытки отправки</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i <= (candidate.submit_attempts || 0) ? 'var(--green-400)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: i <= (candidate.submit_attempts || 0) ? '#fff' : 'var(--text-muted)',
                  }}>{i}</div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Осталось: {3 - (candidate.submit_attempts || 0)} из 3
              </div>
            </div>
          </div>
        </div>

        {candidate.status === 'scoring' && (
          <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 14 }}>⏳</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Заявка оценивается</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              ИИ-ассистент анализирует твою анкету. Страница обновится автоматически...
            </div>
          </div>
        )}

        {score && (
          <div className="card">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-800)', marginBottom: 20 }}>
              Результат оценки
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Итого',        value: score.total_score },
                { label: 'Мотивация',    value: score.motivation_score },
                { label: 'Лидерство',    value: score.leadership_score },
                { label: 'Аутентичность',value: score.authenticity_score },
                { label: 'Рост',         value: score.growth_score },
              ].map(s => {
                const c = scoreColor(s.value)
                return (
                  <div key={s.label} style={{
                    background: c.bg, border: '1.5px solid var(--border)',
                    borderRadius: 10, padding: '12px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: c.color, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>
                      {s.value.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>

            {score.summary && (
              <div style={{
                padding: '14px 16px', background: 'var(--green-50)',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontSize: 14, lineHeight: 1.7, color: 'var(--green-900)', marginBottom: 12,
              }}>
                {score.summary}
              </div>
            )}

            {score.ai_detected && (
              <div style={{
                padding: '11px 14px', background: 'var(--amber-light)',
                color: '#633806', borderRadius: 8, fontSize: 13, fontWeight: 500,
              }}>
                ⚠️ В эссе обнаружены признаки AI-текста. Комиссия рассмотрит это дополнительно.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}