import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/client'
import { ScoreBadge, StatusBadge, AIBadge } from '../components/Badges'

export default function Candidates() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({ search: '', status: '', ai_detected: '', sort: 'score_desc' })

  useEffect(() => {
    loadData()
  }, [filters])

  async function loadData() {
    setLoading(true)
    try {
      const params = {}
      if (filters.search)      params.search      = filters.search
      if (filters.status)      params.status      = filters.status
      if (filters.ai_detected) params.ai_detected = filters.ai_detected
      if (filters.sort)        params.sort        = filters.sort

      const [cRes, sRes] = await Promise.all([
        adminApi.candidates(params),
        adminApi.stats(),
      ])
      setCandidates(cRes.data.results)
      setStats(sRes.data)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  async function handleStatus(id, status) {
    await adminApi.updateStatus(id, status)
    loadData()
  }

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Topbar */}
      <div style={{
        padding: '14px 24px',
        background: 'var(--white)',
        borderBottom: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Все кандидаты</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Дедлайн: <strong style={{ color: 'var(--text)' }}>5 апреля 2025</strong>
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* Статистика */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Всего заявок',  value: stats.total,       color: 'var(--text)' },
              { label: 'Средний скор',  value: stats.avg_score,   color: 'var(--green-600)' },
              { label: 'Шортлист',      value: stats.shortlisted, color: 'var(--green-800)' },
              { label: '⚠️ AI-флаги',   value: stats.ai_flagged,  color: '#633806' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Фильтры */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input placeholder="Поиск по имени, городу..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ width: 220 }} />

          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Все статусы</option>
            <option value="new">Новые</option>
            <option value="scored">Оценённые</option>
            <option value="shortlisted">Шортлист</option>
            <option value="rejected">Отклонённые</option>
          </select>

          <select value={filters.ai_detected} onChange={e => setFilters(f => ({ ...f, ai_detected: e.target.value }))}>
            <option value="">Все</option>
            <option value="true">Только AI-флаги</option>
          </select>

          <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
            <option value="score_desc">Скор ↓</option>
            <option value="score_asc">Скор ↑</option>
            <option value="date_desc">Дата ↓</option>
            <option value="date_asc">Дата ↑</option>
          </select>

          <button className="btn-ghost" onClick={loadData}>Обновить</button>
        </div>

        {/* Таблица */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Кандидат', 'Скор', 'Мотив.', 'Лидерство', 'Аутентич.', 'AI-текст', 'Статус', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.05em',
                    borderBottom: '1.5px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Загружаем...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Нет кандидатов</td></tr>
              ) : candidates.map((c, i) => (
                <tr key={c.id} style={{
                  borderBottom: i < candidates.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background .1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  onClick={() => navigate(`/candidates/${c.id}`)}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'var(--green-50)', color: 'var(--green-800)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{c.initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {c.score ? <ScoreBadge score={c.score.total_score} /> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--green-800)', fontWeight: 600 }}>
                    {c.score ? c.score.motivation_score.toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--green-800)', fontWeight: 600 }}>
                    {c.score ? c.score.leadership_score.toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--green-800)', fontWeight: 600 }}>
                    {c.score ? c.score.authenticity_score.toFixed(1) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {c.score ? <AIBadge detected={c.score.ai_detected} probability={c.score.ai_probability} /> : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.status !== 'shortlisted' && (
                        <button className="btn-green" style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => handleStatus(c.id, 'shortlisted')}>В шортлист</button>
                      )}
                      {c.status !== 'rejected' && (
                        <button className="btn-danger" style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => handleStatus(c.id, 'rejected')}>Отклонить</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Найдено: {candidates.length} кандидатов
        </div>
      </div>
    </div>
  )
}
