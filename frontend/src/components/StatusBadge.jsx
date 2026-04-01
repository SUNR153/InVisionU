const STATUS = {
  new:         { label: 'Новая',          bg: '#E6F1FB', color: '#0C447C' },
  scoring:     { label: 'Оценивается...',  bg: '#FAEEDA', color: '#633806' },
  scored:      { label: 'Оценена',         bg: '#E1F5EE', color: '#085041' },
  shortlisted: { label: 'В шортлисте',     bg: '#E1F5EE', color: '#085041' },
  rejected:    { label: 'Отклонена',       bg: '#FCEBEB', color: '#791F1F' },
}

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.new

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 99,
      fontSize: 13,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
    }}>
      <span style={{
        width: 7, height: 7,
        borderRadius: '50%',
        background: s.color,
        opacity: 0.7,
      }} />
      {s.label}
    </span>
  )
}
