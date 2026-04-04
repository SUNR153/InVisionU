import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ScatterChart, Scatter, CartesianGrid, Legend } from 'recharts'
import { adminApi } from '../api/client'

function MetricCard({ label, value, sub, color = 'var(--green-800)' }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Baseline() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading]       = useState(true)
  const [threshold, setThreshold]   = useState(7)

  useEffect(() => {
    adminApi.candidates({ sort: 'score_desc' })
      .then(({ data }) => setCandidates(data.results.filter(c => c.score)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      Загружаем...
    </div>
  )

  const decided = candidates.filter(c => ['shortlisted', 'rejected'].includes(c.status))

  const baselineResults = decided.map(c => {
    const aiDecision      = c.score.total_score >= threshold ? 'shortlisted' : 'rejected'
    const humanDecision   = c.status
    const match           = aiDecision === humanDecision
    return { ...c, aiDecision, match }
  })

  const correct   = baselineResults.filter(c => c.match).length
  const total     = baselineResults.length
  const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0

  const truePos   = baselineResults.filter(c => c.aiDecision === 'shortlisted' && c.status === 'shortlisted').length
  const falsePos  = baselineResults.filter(c => c.aiDecision === 'shortlisted' && c.status === 'rejected').length
  const falseNeg  = baselineResults.filter(c => c.aiDecision === 'rejected'    && c.status === 'shortlisted').length
  const trueNeg   = baselineResults.filter(c => c.aiDecision === 'rejected'    && c.status === 'rejected').length

  const precision = truePos + falsePos > 0 ? Math.round((truePos / (truePos + falsePos)) * 100) : 0
  const recall    = truePos + falseNeg > 0 ? Math.round((truePos / (truePos + falseNeg)) * 100) : 0

  const buckets = [
    { name: '0–3',   count: candidates.filter(c => c.score.total_score < 3).length,  fill: '#E24B4A' },
    { name: '3–5',   count: candidates.filter(c => c.score.total_score >= 3 && c.score.total_score < 5).length, fill: '#EF9F27' },
    { name: '5–7',   count: candidates.filter(c => c.score.total_score >= 5 && c.score.total_score < 7).length, fill: '#FAC775' },
    { name: '7–8',   count: candidates.filter(c => c.score.total_score >= 7 && c.score.total_score < 8).length, fill: '#9FE1CB' },
    { name: '8–10',  count: candidates.filter(c => c.score.total_score >= 8).length,  fill: '#1D9E75' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: '14px 24px', background: 'var(--white)', borderBottom: '1.5px solid var(--border)', fontSize: 17, fontWeight: 700 }}>
        Baseline анализ
      </div>

      <div style={{ padding: 24 }}>

        <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--green-50)', border: '1.5px solid var(--green-100)' }}>
          <div style={{ fontSize: 13, color: 'var(--green-800)', lineHeight: 1.7 }}>
            <strong>Baseline правило:</strong> если AI скор ≥ порога → шортлист, иначе → отклонить.<br />
            Сравниваем это простое правило с реальными решениями комиссии. Чем выше совпадение — тем лучше AI понимает критерии отбора.
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 12 }}>
            Порог скора для шортлиста
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={4} max={9} step={0.5} value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              style={{ flex: 1 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-600)', minWidth: 36 }}>
              {threshold}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            <span>Мягкий (4)</span>
            <span>Строгий (9)</span>
          </div>
        </div>

        {total > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              <MetricCard label="Точность baseline" value={`${accuracy}%`} sub={`${correct} из ${total} решений`} color="var(--green-800)" />
              <MetricCard label="Precision" value={`${precision}%`} sub="Из предсказанных шортлист" color="var(--green-600)" />
              <MetricCard label="Recall" value={`${recall}%`} sub="Найдено реальных шортлист" color="#0C447C" />
              <MetricCard label="Проанализировано" value={total} sub="кандидатов с решением" color="var(--text)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 14 }}>Матрица решений</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}></th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Комиссия: шортлист</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Комиссия: отклонил</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 12, borderBottom: '1px solid var(--border)', color: 'var(--green-800)' }}>AI: шортлист</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)', background: '#E1F5EE', fontWeight: 700, color: 'var(--green-800)' }}>{truePos} ✓</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)', background: '#FCEBEB', color: '#791F1F', fontWeight: 700 }}>{falsePos} ✗</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 12, color: '#791F1F' }}>AI: отклонил</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', background: '#FCEBEB', color: '#791F1F', fontWeight: 700 }}>{falseNeg} ✗</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', background: '#E1F5EE', fontWeight: 700, color: 'var(--green-800)' }}>{trueNeg} ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 14 }}>Распределение скоров</div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} barSize={40}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={v => [v, 'Кандидатов']} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {buckets.map((b, i) => <Cell key={i} fill={b.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--green-800)' }}>
                Детальное сравнение AI vs Комиссия
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Кандидат', 'AI скор', 'AI решение', 'Комиссия', 'Совпадение'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1.5px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {baselineResults.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < baselineResults.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.city}</div>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: c.score.total_score >= threshold ? 'var(--green-800)' : '#791F1F' }}>
                        {c.score.total_score.toFixed(1)}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                          background: c.aiDecision === 'shortlisted' ? 'var(--green-50)' : 'var(--red-bg)',
                          color: c.aiDecision === 'shortlisted' ? 'var(--green-800)' : '#791F1F',
                        }}>
                          {c.aiDecision === 'shortlisted' ? 'Шортлист' : 'Отклонить'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                          background: c.status === 'shortlisted' ? 'var(--green-50)' : 'var(--red-bg)',
                          color: c.status === 'shortlisted' ? 'var(--green-800)' : '#791F1F',
                        }}>
                          {c.status === 'shortlisted' ? 'Шортлист' : 'Отклонён'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 18 }}>
                        {c.match ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Нет данных для анализа</div>
            <div style={{ fontSize: 13 }}>Нужны кандидаты с оценкой и решением комиссии (шортлист или отклонён)</div>
          </div>
        )}
      </div>
    </div>
  )
}