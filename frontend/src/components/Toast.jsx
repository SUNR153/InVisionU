import { useState, useEffect } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  function show(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  return { toast, showToast: show }
}

export function Toast({ toast }) {
  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      padding: '12px 20px',
      background: isSuccess ? 'var(--green)' : 'var(--red)',
      color: '#fff',
      borderRadius: 'var(--radius-sm)',
      fontSize: 14,
      fontWeight: 500,
      zIndex: 1000,
      maxWidth: 320,
      animation: 'slideIn 0.2s ease',
    }}>
      {toast.message}
    </div>
  )
}
