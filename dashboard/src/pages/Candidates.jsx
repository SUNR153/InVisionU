import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../api/client'
import { ScoreBadge, StatusBadge, AIBadge } from '../components/Badges'

function scoreColor(v) {
  if (v >= 8) return '#085041'
  if (v >= 5) return '#633806'
  return '#791F1F'
}

export default function Candidates({ defaultStatus = '', defaultAI = '' }) {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters] = useState({
    search: '', status: defaultStatus, ai_detected: defaultAI, sort: 'score_desc'
  })

  useEffect(() => { load() }, [filters])

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (filters.search)      params.search      = filters.search
      if (filters.status)      params.status      = filters.status
      if (filters.ai_detected) params.ai_detected = filters.ai_detected
      if (filters.sort)        params.sort        = filters.sort
      const [cRes, sRes] = await Promise.all([adminApi.candidates(params), adminApi.stats()])
      setCandidates(cRes.data.results)
      setStats(sRes.data)
    } finally { setLoading(false) }
  }

  async function handleStatus(e, id, status) {
    e.stopPropagation()
    await adminApi.updateStatus(id, status)
    load()
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', paddingTop: 0 }} className="candidates-page">
      <style>{`
        @media (max-width: 768px) {
          .candidates-page { padding-top: 57px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .filters-row { flex-direction: column !important; }
          .filters-row input, .filters-row select { width: 100% !important; }
          .table-wrap th:nth-child(3),
          .table-wrap th:nth-child(4),
          .table-wrap th:nth-child(5),
          .table-wrap td:nth-child(3),
          .table-wrap td:nth-child(4),
          .table-wrap td:nth-child(5) { display: none !important; }
          .action-btns { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ padding: '14px 24px', background: 'var(--white)', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Все кандидаты</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Дедлайн: <strong style={{ color: 'var(--text)' }}>5 апреля 2026</strong></div>
      </div>

      <div style={{ padding: 24 }}>
        {stats && (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Всего заявок',  value: stats.total,       color: 'var(--text)' },
              { label: 'Средний скор',  value: stats.avg_score,   color: stats.avg_score >= 7 ? 'var(--green-800)' : stats.avg_score >= 5 ? '#633806' : '#791F1F' },
              { label: 'Шортлист',      value: stats.shortlisted, color: 'var(--green-800)' },
              { label: '⚠️ AI-флаги',   value: stats.ai_flagged,  color: '#633806' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="filters-row" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Поиск по имени, городу..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={{ width: 220 }} />
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
          <button className="btn-ghost" onClick={load}>↻</button>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>Найдено: {candidates.length}</span>
        </div>

        <div className="card table-wrap" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Кандидат', 'Скор', 'Мотив.', 'Лидерство', 'Аутентич.', 'AI-текст', 'Статус', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Загружаем...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Нет кандидатов</td></tr>
              ) : candidates.map((c, i) => (
                <tr key={c.id}
                  style={{ borderBottom: i < candidates.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                  onClick={() => navigate(`/candidates/${c.id}`)}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-50)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.initials}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.full_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.city}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{c.score ? <ScoreBadge score={c.score.total_score} /> : '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: c.score ? scoreColor(c.score.motivation_score) : 'var(--muted)' }}>{c.score ? c.score.motivation_score.toFixed(1) : '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: c.score ? scoreColor(c.score.leadership_score) : 'var(--muted)' }}>{c.score ? c.score.leadership_score.toFixed(1) : '—'}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: c.score ? scoreColor(c.score.authenticity_score) : 'var(--muted)' }}>{c.score ? c.score.authenticity_score.toFixed(1) : '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{c.score ? <AIBadge detected={c.score.ai_detected} probability={c.score.ai_probability} /> : '—'}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                    <div className="action-btns" style={{ display: 'flex', gap: 5 }}>
                      {c.status !== 'shortlisted' && <button className="btn-green" style={{ fontSize: 11, padding: '4px 10px' }} onClick={e => handleStatus(e, c.id, 'shortlisted')}>Шортлист</button>}
                      {c.status !== 'rejected'    && <button className="btn-red"   style={{ fontSize: 11, padding: '4px 10px' }} onClick={e => handleStatus(e, c.id, 'rejected')}>Отклонить</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}