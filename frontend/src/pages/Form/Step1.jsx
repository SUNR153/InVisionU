export default function Step1({ data, onChange, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Личные данные</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
        Расскажи о себе — это основа твоей заявки.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Имя *</label>
          <input
            placeholder="Айгерим"
            value={data.first_name || ''}
            onChange={e => onChange('first_name', e.target.value)}
          />
          {errors.first_name && <div className="error-text">{errors.first_name}</div>}
        </div>
        <div>
          <label className="label">Фамилия *</label>
          <input
            placeholder="Сейткали"
            value={data.last_name || ''}
            onChange={e => onChange('last_name', e.target.value)}
          />
          {errors.last_name && <div className="error-text">{errors.last_name}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="label">Возраст *</label>
          <input
            type="number"
            placeholder="17"
            min={14} max={30}
            value={data.age || ''}
            onChange={e => onChange('age', e.target.value)}
          />
          {errors.age && <div className="error-text">{errors.age}</div>}
        </div>
        <div>
          <label className="label">Город *</label>
          <input
            placeholder="Алматы"
            value={data.city || ''}
            onChange={e => onChange('city', e.target.value)}
          />
          {errors.city && <div className="error-text">{errors.city}</div>}
        </div>
      </div>

      <div>
        <label className="label">Школа / колледж *</label>
        <input
          placeholder="НИШ Алматы"
          value={data.school || ''}
          onChange={e => onChange('school', e.target.value)}
        />
        {errors.school && <div className="error-text">{errors.school}</div>}
      </div>

      <div>
        <label className="label">Телефон</label>
        <input
          placeholder="+7 777 000 00 00"
          value={data.phone || ''}
          onChange={e => onChange('phone', e.target.value)}
        />
      </div>
    </div>
  )
}
