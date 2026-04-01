import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { adminApi } from '../api/client'

export default function Stats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminApi.stats().then(({ data }) => setStats(data))
  }, [])

  if (!stats) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Загружаем...
    </div>
  )

  const distData = [
    { name: 'Высокий (8-10)', value: stats.distribution.high,   fill: '#1D9E75' },
    { name: 'Средний (5-7)',  value: stats.distribution.medium, fill: '#EF9F27' },
    { name: 'Низкий (0-4)',   value: stats.distribution.low,    fill: '#E24B4A' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{
        padding: '14px 24px', background: 'var(--white)',
        borderBottom: '1.5px solid var(--border)',
        fontSize: 17, fontWeight: 700,
      }}>Статистика</div>

      <div style={{ padding: 24 }}>
        {/* Метрики */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Всего заявок',  value: stats.total,       sub: 'кандидатов' },
            { label: 'Средний скор',  value: stats.avg_score,   sub: 'из 10' },
            { label: 'В шортлисте',   value: stats.shortlisted, sub: `${Math.round(stats.shortlisted / stats.total * 100) || 0}% от всех` },
            { label: 'AI-флаги',      value: stats.ai_flagged,  sub: 'на проверке' },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--green-800)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Диаграмма распределения */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-800)', marginBottom: 20 }}>
            Распределение по скору
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} barSize={60}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v, 'Кандидатов']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {distData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
