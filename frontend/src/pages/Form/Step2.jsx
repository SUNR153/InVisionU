export default function Step2({ data, onChange, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Мотивация и цели</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
        Нам важна твоя настоящая история — пиши своими словами, без шаблонов.
      </p>

      <div>
        <label className="label">Почему ты хочешь в inVision U? *</label>
        <textarea
          rows={5}
          placeholder="Расскажи что тебя привлекает в программе, почему именно сейчас и чего ты хочешь достичь..."
          value={data.motivation || ''}
          onChange={e => onChange('motivation', e.target.value)}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {(data.motivation || '').length} символов (рекомендуем 200+)
        </div>
        {errors.motivation && <div className="error-text">{errors.motivation}</div>}
      </div>

      <div>
        <label className="label">Где видишь себя через 5 лет? *</label>
        <textarea
          rows={4}
          placeholder="Опиши конкретно — кем хочешь стать, что построить, какую роль играть в обществе..."
          value={data.future || ''}
          onChange={e => onChange('future', e.target.value)}
        />
        {errors.future && <div className="error-text">{errors.future}</div>}
      </div>
    </div>
  )
}
