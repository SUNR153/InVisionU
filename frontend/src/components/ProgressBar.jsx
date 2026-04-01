export default function ProgressBar({ current, total }) {
  const steps = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Шаг {current} из {total}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Math.round((current / total) * 100)}%
        </span>
      </div>

      {/* Линейный прогресс */}
      <div style={{
        display: 'flex', gap: 6,
      }}>
        {steps.map(step => (
          <div key={step} style={{
            flex: 1,
            height: 4,
            borderRadius: 99,
            background: step <= current ? 'var(--green)' : 'var(--border)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Лейблы шагов */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {['Данные', 'Мотивация', 'Достижения', 'Эссе'].map((label, i) => (
          <span key={i} style={{
            fontSize: 11,
            color: i + 1 <= current ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: i + 1 === current ? 500 : 400,
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
