import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { adminApi } from '../api/client'
import { StatusBadge, AIBadge } from '../components/Badges'
import Comments from '../components/Comments'

function Field({ label, value }) {
  if (!value) return null
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  )
}

export default function CandidateCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState(null)

  useEffect(() => {
    adminApi.candidate(id).then(({ data }) => setCandidate(data)).finally(() => setLoading(false))
  }, [id])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleStatus(status) {
    setSaving(true)
    await adminApi.updateStatus(id, status)
    setCandidate(c => ({ ...c, status }))
    showToast(status === 'shortlisted' ? 'Добавлен в шортлист ⭐' : 'Отклонён')
    setSaving(false)
  }

  async function handleRescore() {
    setSaving(true)
    await adminApi.rescore(id)
    showToast('Переоценка запущена...')
    setSaving(false)
    setTimeout(() => adminApi.candidate(id).then(({ data }) => setCandidate(data)), 4000)
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Загружаем...</div>
  if (!candidate) return null

  const score = candidate.score
  const radarData = score ? [
    { subject: 'Мотивация',    value: score.motivation_score },
    { subject: 'Лидерство',    value: score.leadership_score },
    { subject: 'Аутентичность',value: score.authenticity_score },
    { subject: 'Рост',         value: score.growth_score },
  ] : []

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 20px', background: toast.type === 'success' ? 'var(--green-800)' : 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ padding: '14px 24px', background: 'var(--white)', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button className="btn-ghost" onClick={() => navigate('/candidates')} style={{ padding: '6px 12px' }}>← Назад</button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{candidate.full_name}</div>
        <StatusBadge status={candidate.status} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={handleRescore} disabled={saving} style={{ fontSize: 12 }}>↻ Переоценить</button>
          {candidate.status !== 'shortlisted' && <button className="btn-green" onClick={() => handleStatus('shortlisted')} disabled={saving}>В шортлист ⭐</button>}
          {candidate.status !== 'rejected'    && <button className="btn-red"   onClick={() => handleStatus('rejected')}    disabled={saving}>Отклонить</button>}
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,var(--green),var(--green-600))', color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{candidate.initials}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{candidate.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{candidate.age} лет · {candidate.city} · {candidate.school}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{candidate.email}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Подана</div>
                <div style={{ fontWeight: 600 }}>{new Date(candidate.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
                <div style={{ fontSize: 12, color: 'var(--green-600)', marginTop: 4 }}>Заполнено: {candidate.completion_percent}%</div>
              </div>
            </div>
          </div>

          <Field label="Почему inVision U?"             value={candidate.motivation} />
          <Field label="Планы на 5 лет"                 value={candidate.future} />
          <Field label="Главное достижение"              value={candidate.achievement} />
          <Field label="Проблема которую хочет решить"   value={candidate.problem} />
          <Field label="Эссе"                            value={candidate.essay} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {score ? (
            <>
              <div className="card" style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg,var(--green-50),var(--green-100))' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-800)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Общий скор</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--green-800)', lineHeight: 1 }}>{score.total_score.toFixed(1)}</div>
                <div style={{ fontSize: 13, color: 'var(--green-600)', marginTop: 6 }}>
                  {score.recommendation === 'high' ? '★ Высокий приоритет' : score.recommendation === 'medium' ? '◆ Средний приоритет' : '▼ Низкий приоритет'}
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 12 }}>По критериям</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                      <Radar dataKey="value" stroke="var(--green)" fill="var(--green)" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'Мотивация',      value: score.motivation_score },
                    { label: 'Лидерство',      value: score.leadership_score },
                    { label: 'Аутентичность',  value: score.authenticity_score },
                    { label: 'Рост',           value: score.growth_score },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '10px', background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-600)' }}>{s.value.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 12 }}>Анализ Claude</div>
                {score.summary && <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 14, color: 'var(--text)' }}>{score.summary}</div>}

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase' }}>AI-текст</div>
                  <AIBadge detected={score.ai_detected} probability={score.ai_probability} />
                  {score.ai_probability > 0 && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{Math.round(score.ai_probability * 100)}%</span>}
                </div>

                {score.strengths?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Сильные стороны</div>
                    {score.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>{s}</div>)}
                  </div>
                )}

                {score.red_flags?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>Красные флаги</div>
                    {score.red_flags.map((f, i) => <div key={i} style={{ fontSize: 13, marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: 'var(--red)', fontWeight: 700 }}>!</span>{f}</div>)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 36, color: 'var(--muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Ещё не оценён</div>
              <div style={{ fontSize: 13 }}>Кандидат не отправил заявку или скоринг ещё идёт</div>
            </div>
          )}

          <Comments candidateId={id} />
        </div>
      </div>
    </div>
  )
}