export function ScoreBadge({ score }) {
  const high   = score >= 8
  const medium = score >= 5 && score < 8
  const color  = high ? 'var(--green-800)' : medium ? '#633806' : '#791F1F'
  const bg     = high ? 'var(--green-50)'  : medium ? 'var(--amber-light)' : 'var(--red-light)'

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 700,
      background: bg, color,
    }}>
      {score.toFixed(1)}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    new:         { label: 'Новый',        bg: 'var(--blue-light)', color: 'var(--blue)' },
    scoring:     { label: 'Оценивается',  bg: 'var(--amber-light)', color: '#633806' },
    scored:      { label: 'Оценён',       bg: 'var(--green-50)',    color: 'var(--green-800)' },
    shortlisted: { label: 'Шортлист',     bg: 'var(--green-50)',    color: 'var(--green-800)' },
    rejected:    { label: 'Отклонён',     bg: 'var(--red-light)',   color: '#791F1F' },
  }
  const s = map[status] || map.new
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, opacity: .8 }} />
      {s.label}
    </span>
  )
}

export function AIBadge({ detected, probability }) {
  if (detected) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#791F1F' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E24B4A', display: 'inline-block' }} />
      Обнаружен
    </span>
  )
  if (probability > 0.4) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#633806' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
      Вероятно
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--green-800)' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green-400)', display: 'inline-block' }} />
      Чистый
    </span>
  )
}
