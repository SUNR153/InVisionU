export default function Step4({ data, onChange, errors }) {
  function handleFile(e) {
    const file = e.target.files[0]
    if (file) onChange('essay_file', file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Эссе</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
        Это твой главный шанс показать себя. Пиши искренне — комиссия ценит настоящий голос, а не красивые слова.
      </p>

      <div style={{
        padding: '12px 16px',
        background: '#FAEEDA',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        color: '#633806',
        lineHeight: 1.6,
      }}>
        Не используй ChatGPT для написания эссе — система это определяет.
        Лучше напиши проще но своими словами.
      </div>

      <div>
        <label className="label">Эссе *</label>
        <textarea
          rows={10}
          placeholder="Расскажи свою историю. Кто ты, откуда пришёл(пришла), что тебя сформировало, к чему стремишься и почему именно inVision U поможет тебе туда прийти..."
          value={data.essay || ''}
          onChange={e => onChange('essay', e.target.value)}
          style={{ minHeight: 200 }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}>
          <span>{(data.essay || '').length} символов</span>
          <span>Рекомендуем 500–1000 символов</span>
        </div>
        {errors.essay && <div className="error-text">{errors.essay}</div>}
      </div>

      <div>
        <label className="label">Или загрузи файл (PDF, DOCX) — необязательно</label>
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: data.essay_file ? 'var(--green-light)' : '#fafafa',
        }}
          onClick={() => document.getElementById('essay-file').click()}
        >
          {data.essay_file ? (
            <div style={{ color: 'var(--green-dark)', fontSize: 14, fontWeight: 500 }}>
              ✓ {data.essay_file.name || 'Файл загружен'}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Нажми чтобы выбрать файл
            </div>
          )}
        </div>
        <input
          id="essay-file"
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
    </div>
  )
}
