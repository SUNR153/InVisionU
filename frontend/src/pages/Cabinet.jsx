import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { candidateApi } from '../api/client'

const CHECKLIST = [
  { key: 'motivation', label: 'Мотивация заполнена' },
  { key: 'achievement', label: 'Достижения заполнены' },
  { key: 'problem', label: 'Проблема описана' },
  { key: 'future', label: 'Планы на 5 лет' },
  { key: 'essay', label: 'Эссе написано' },
]

function ScoreBar({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--green-dark)' }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--border)' }}>
        <div style={{
          height: '100%',
          borderRadius: 99,
          background: value >= 8 ? 'var(--green)' : value >= 5 ? '#EF9F27' : '#E24B4A',
          width: `${value * 10}%`,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
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

  // Автообновление пока идёт скоринг
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
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        Загружаем...
      </div>
    </div>
  )

  if (!candidate) return null

  const score = candidate.score
  const daysLeft = Math.max(0, Math.ceil(
    (new Date('2025-04-05') - new Date()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* Шапка */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'var(--green-light)',
            color: 'var(--green-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, flexShrink: 0,
          }}>
            {candidate.initials}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{candidate.full_name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {candidate.school} · {candidate.city}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={candidate.status} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Прогресс заявки */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Прогресс заявки
            </div>
            {CHECKLIST.map(item => {
              const done = candidate[item.key] && candidate[item.key].trim()
              return (
                <div key={item.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 13,
                }}>
                  <div style={{
                    width: 18, height: 18,
                    borderRadius: '50%',
                    background: done ? 'var(--green-light)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {done && <span style={{ color: 'var(--green)', fontSize: 11 }}>✓</span>}
                  </div>
                  <span style={{ color: done ? 'var(--text)' : 'var(--text-muted)' }}>
                    {item.label}
                  </span>
                </div>
              )
            })}

            {candidate.status === 'new' && (
              <Link to="/form" style={{ display: 'block', marginTop: 16 }}>
                <button className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                  Продолжить анкету →
                </button>
              </Link>
            )}
          </div>

          {/* Дедлайн и статус */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Дедлайн</div>
                <div style={{ fontWeight: 600 }}>5 апреля, 23:59</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)' }}>{daysLeft}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>дней осталось</div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Заполненность анкеты</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>
                {candidate.completion_percent}%
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                <div style={{
                  height: '100%',
                  borderRadius: 99,
                  background: 'var(--green)',
                  width: `${candidate.completion_percent}%`,
                  transition: 'width 0.6s',
                }} />
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Подана</div>
              <div style={{ fontWeight: 500 }}>
                {new Date(candidate.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI оценка если есть */}
        {score && (
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              Результат оценки
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}>
              {[
                { label: 'Общий скор', value: score.total_score },
                { label: 'Мотивация', value: score.motivation_score },
                { label: 'Лидерство', value: score.leadership_score },
                { label: 'Аутентичность', value: score.authenticity_score },
                { label: 'Рост', value: score.growth_score },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green-dark)' }}>
                    {s.value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>

            {score.summary && (
              <div style={{
                padding: '14px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 16,
              }}>
                {score.summary}
              </div>
            )}

            {score.ai_detected && (
              <div style={{
                padding: '10px 14px',
                background: '#FAEEDA',
                color: '#633806',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
              }}>
                В эссе обнаружены признаки AI-текста. Комиссия рассмотрит это дополнительно.
              </div>
            )}
          </div>
        )}

        {/* Скоринг идёт */}
        {candidate.status === 'scoring' && (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Заявка оценивается</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Наш ИИ-ассистент анализирует твою анкету. Обновляется автоматически...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
