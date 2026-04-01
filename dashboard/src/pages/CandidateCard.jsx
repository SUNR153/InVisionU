import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { adminApi } from '../api/client'
import { StatusBadge, AIBadge } from '../components/Badges'

export default function CandidateCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    adminApi.candidate(id)
      .then(({ data }) => setCandidate(data))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatus(status) {
    setSaving(true)
    await adminApi.updateStatus(id, status)
    setCandidate(c => ({ ...c, status }))
    setSaving(false)
  }

  async function handleRescore() {
    setSaving(true)
    await adminApi.rescore(id)
    setSaving(false)
    setTimeout(() => {
      adminApi.candidate(id).then(({ data }) => setCandidate(data))
    }, 3000)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Загружаем...
    </div>
  )
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
      {/* Topbar */}
      <div style={{
        padding: '14px 24px', background: 'var(--white)',
        borderBottom: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button className="btn-ghost" onClick={() => navigate('/candidates')} style={{ padding: '6px 12px' }}>
          ← Назад
        </button>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{candidate.full_name}</div>
        <StatusBadge status={candidate.status} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={handleRescore} disabled={saving} style={{ fontSize: 12 }}>
            Переоценить
          </button>
          {candidate.status !== 'shortlisted' && (
            <button className="btn-green" onClick={() => handleStatus('shortlisted')} disabled={saving}>
              В шортлист ⭐
            </button>
          )}
          {candidate.status !== 'rejected' && (
            <button className="btn-danger" onClick={() => handleStatus('rejected')} disabled={saving}>
              Отклонить
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Левая колонка */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Профиль */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--green-400), var(--green-600))',
                color: '#fff', fontSize: 20, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{candidate.initials}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{candidate.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {candidate.age} лет · {candidate.city} · {candidate.school}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{candidate.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Подана</div>
                <div style={{ fontWeight: 600 }}>
                  {new Date(candidate.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg)', borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Заполненность</div>
                <div style={{ fontWeight: 600, color: 'var(--green-600)' }}>{candidate.completion_percent}%</div>
              </div>
            </div>
          </div>

          {/* Ответы на вопросы */}
          {[
            { label: 'Почему inVision U?', value: candidate.motivation },
            { label: 'Главное достижение', value: candidate.achievement },
            { label: 'Проблема которую хочет решить', value: candidate.problem },
            { label: 'Планы на 5 лет', value: candidate.future },
            { label: 'Эссе', value: candidate.essay },
          ].filter(q => q.value).map(q => (
            <div key={q.label} className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                {q.label}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {q.value}
              </div>
            </div>
          ))}
        </div>

        {/* Правая колонка — скор */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {score ? (
            <>
              {/* Радарная диаграмма */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 12 }}>
                  Оценка по критериям
                </div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <Radar dataKey="value" stroke="var(--green-400)" fill="var(--green-400)" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Скоры */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'Мотивация',     value: score.motivation_score },
                    { label: 'Лидерство',     value: score.leadership_score },
                    { label: 'Аутентичность', value: score.authenticity_score },
                    { label: 'Рост',          value: score.growth_score },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-600)' }}>{s.value.toFixed(1)}</div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 14, padding: '12px', borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--green-50), var(--green-100))',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--green-800)', fontWeight: 600, marginBottom: 4 }}>ОБЩИЙ СКОР</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--green-800)' }}>{score.total_score.toFixed(1)}</div>
                </div>
              </div>

              {/* AI анализ */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 12 }}>
                  Анализ Claude
                </div>

                {score.summary && (
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 14 }}>
                    {score.summary}
                  </div>
                )}

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>AI-текст</div>
                  <AIBadge detected={score.ai_detected} probability={score.ai_probability} />
                  {score.ai_probability > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {Math.round(score.ai_probability * 100)}% вероятность
                    </span>
                  )}
                </div>

                {score.strengths?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Сильные стороны</div>
                    {score.strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5, fontSize: 13 }}>
                        <span style={{ color: 'var(--green-400)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {s}
                      </div>
                    ))}
                  </div>
                )}

                {score.red_flags?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Красные флаги</div>
                    {score.red_flags.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5, fontSize: 13 }}>
                        <span style={{ color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>!</span>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Ещё не оценён</div>
              <div style={{ fontSize: 13 }}>Кандидат не отправил заявку или оценка ещё идёт</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
