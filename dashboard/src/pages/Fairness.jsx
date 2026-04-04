import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { adminApi } from '../api/client'

export default function Fairness() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading]       = useState(true)

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

  const cityMap = {}
  candidates.forEach(c => {
    const city = c.city || 'Не указан'
    if (!cityMap[city]) cityMap[city] = []
    cityMap[city].push(c.score.total_score)
  })
  const cityData = Object.entries(cityMap)
    .map(([city, scores]) => ({
      city,
      avg: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      count: scores.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10)

  const shortlisted = candidates.filter(c => c.status === 'shortlisted')
  const rejected    = candidates.filter(c => c.status === 'rejected')

  function avg(arr, key) {
    if (!arr.length) return 0
    return parseFloat((arr.reduce((s, c) => s + c.score[key], 0) / arr.length).toFixed(1))
  }

  const criteriaData = [
    { name: 'Мотивация',    shortlisted: avg(shortlisted, 'motivation_score'),   rejected: avg(rejected, 'motivation_score') },
    { name: 'Лидерство',    shortlisted: avg(shortlisted, 'leadership_score'),   rejected: avg(rejected, 'leadership_score') },
    { name: 'Аутентичность',shortlisted: avg(shortlisted, 'authenticity_score'), rejected: avg(rejected, 'authenticity_score') },
    { name: 'Рост',         shortlisted: avg(shortlisted, 'growth_score'),       rejected: avg(rejected, 'growth_score') },
  ]

  const aiInShortlist = shortlisted.filter(c => c.score.ai_detected).length
  const aiInRejected  = rejected.filter(c => c.score.ai_detected).length

  const allAvgs     = cityData.map(c => c.avg)
  const mean        = allAvgs.reduce((a, b) => a + b, 0) / (allAvgs.length || 1)
  const variance    = allAvgs.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (allAvgs.length || 1)
  const stdDev      = parseFloat(Math.sqrt(variance).toFixed(2))

  const COLORS = ['#1D9E75', '#0F6E56', '#9FE1CB', '#5DCAA5', '#085041', '#04342C', '#E1F5EE', '#1D9E75', '#0F6E56', '#9FE1CB']

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: '14px 24px', background: 'var(--white)', borderBottom: '1.5px solid var(--border)', fontSize: 17, fontWeight: 700 }}>
        Fairness анализ
      </div>

      <div style={{ padding: 24 }}>

        <div className="card" style={{ marginBottom: 20, padding: '16px 20px', background: 'var(--green-50)', border: '1.5px solid var(--green-100)' }}>
          <div style={{ fontSize: 13, color: 'var(--green-800)', lineHeight: 1.7 }}>
            <strong>Цель анализа:</strong> убедиться что AI оценивает кандидатов честно — без предвзятости по городу, школе или другим демографическим признакам. Низкое стандартное отклонение между группами говорит о справедливости.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Городов проанализировано</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-800)' }}>{cityData.length}</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Std. отклонение по городам</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: stdDev < 1.5 ? 'var(--green-800)' : '#633806' }}>{stdDev}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{stdDev < 1.5 ? '✅ Низкое — всё честно' : '⚠️ Есть разброс'}</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>AI-текст в шортлисте</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: aiInShortlist === 0 ? 'var(--green-800)' : '#633806' }}>{aiInShortlist}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>из {shortlisted.length} в шортлисте</div>
          </div>
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>AI-текст в отклонённых</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--green-800)' }}>{aiInRejected}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>из {rejected.length} отклонённых</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 16 }}>
              Средний скор по городам
            </div>
            {cityData.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Нет данных</div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical" barSize={18}>
                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip formatter={(v, n, p) => [`${v} (${p.payload.count} чел.)`, 'Средний скор']} />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                      {cityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
              Разброс между городами: ±{stdDev} — {stdDev < 1.5 ? 'в пределах нормы' : 'требует внимания'}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 16 }}>
              Шортлист vs Отклонённые — по критериям
            </div>
            {criteriaData.every(d => d.shortlisted === 0 && d.rejected === 0) ? (
              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>Нет данных для сравнения</div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={criteriaData} barSize={20}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="shortlisted" name="Шортлист" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected"    name="Отклонённые" fill="#E24B4A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 10 }}>Заключение по честности системы</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, lineHeight: 1.6 }}>
            <div>✅ Система <strong>не использует</strong> город, школу или возраст как прямые критерии оценки</div>
            <div>✅ Оценка основана только на содержании ответов кандидата</div>
            <div>✅ AI-детект применяется ко всем кандидатам одинаково</div>
            <div>✅ Финальное решение всегда за комиссией — AI только рекомендует</div>
            {stdDev < 1.5
              ? <div>✅ Разброс скоров по городам в норме (σ = {stdDev}) — нет географической предвзятости</div>
              : <div>⚠️ Разброс по городам выше нормы (σ = {stdDev}) — рекомендуется дополнительная проверка</div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}