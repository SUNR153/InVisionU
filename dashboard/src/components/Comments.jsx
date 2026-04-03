import { useState, useEffect } from 'react'
import { adminApi } from '../api/client'

export default function Comments({ candidateId }) {
  const [comments, setComments] = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)

  useEffect(() => {
    adminApi.comments(candidateId).then(({ data }) => setComments(data))
  }, [candidateId])

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    try {
      const { data } = await adminApi.addComment(candidateId, text)
      setComments(c => [data, ...c])
      setText('')
    } finally { setSending(false) }
  }

  return (
    <div className="card">
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)', marginBottom: 14 }}>
        Комментарии комиссии
      </div>

      <div style={{ marginBottom: 16 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Напиши комментарий — кандидат получит письмо..."
          style={{
            width: '100%', padding: '9px 12px', fontSize: 13,
            border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
            background: 'var(--white)', color: 'var(--text)',
            resize: 'vertical', minHeight: 80, lineHeight: 1.6,
            fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--green)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="btn-green"
          style={{ marginTop: 8, width: '100%', padding: 9 }}
        >
          {sending ? 'Отправляем...' : 'Отправить комментарий + письмо кандидату'}
        </button>
      </div>

      {comments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '16px 0' }}>
          Комментариев пока нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map(c => (
            <div key={c.id} style={{
              padding: '10px 12px',
              background: 'var(--bg)',
              borderRadius: 8,
              borderLeft: '3px solid var(--green-100)',
            }}>
              <div style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{c.text}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {c.author} · {new Date(c.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}