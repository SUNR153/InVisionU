export default function Step3({ data, onChange, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Достижения</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
        Нас интересует твой реальный опыт — не оценки, а конкретные действия и результаты.
      </p>

      <div>
        <label className="label">Твоё главное достижение *</label>
        <textarea
          rows={5}
          placeholder="Опиши проект, инициативу или опыт которым гордишься. Что именно делал(а), какой результат получил(а)?"
          value={data.achievement || ''}
          onChange={e => onChange('achievement', e.target.value)}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {(data.achievement || '').length} символов (рекомендуем 200+)
        </div>
        {errors.achievement && <div className="error-text">{errors.achievement}</div>}
      </div>

      <div>
        <label className="label">Какую проблему в обществе хочешь решить? *</label>
        <textarea
          rows={4}
          placeholder="Опиши конкретную проблему которую видишь вокруг себя и почему она важна лично для тебя..."
          value={data.problem || ''}
          onChange={e => onChange('problem', e.target.value)}
        />
        {errors.problem && <div className="error-text">{errors.problem}</div>}
      </div>
    </div>
  )
}
