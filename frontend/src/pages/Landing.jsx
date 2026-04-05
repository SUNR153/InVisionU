import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const steps = [
  { n: '📋', title: 'Заполни анкету', desc: 'Личные данные, мотивация и достижения. Займёт ~15 минут.' },
  { n: '✍️', title: 'Напиши эссе', desc: 'Расскажи свою историю своими словами — без шаблонов.' },
  { n: '🤖', title: 'AI оценивает', desc: 'Claude анализирует твою заявку по 4 критериям объективно.' },
  { n: '🎯', title: 'Получи решение', desc: 'Приёмная комиссия рассмотрит заявку в течение 2 недель.' },
]

const features = [
  { icon: '⚡', title: 'Быстро', desc: 'Результат через 1–2 минуты после отправки' },
  { icon: '🔍', title: 'Прозрачно', desc: 'Ты видишь свой скор и объяснение оценки' },
  { icon: '⚖️', title: 'Честно', desc: 'AI не знает твой город или школу — только текст' },
]

export default function Landing() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--green-light) 0%, #fff 100%)',
        padding: '72px 24px 56px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '5px 14px',
            background: 'var(--green-light)', color: 'var(--green-dark)',
            borderRadius: 99, marginBottom: 24, fontWeight: 600,
            border: '1px solid var(--green-100)',
          }}>
            🎓 100% грантовое обучение от inDrive
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Стань частью<br />
            <span style={{ color: 'var(--green-dark)' }}>inVision University</span>
          </h1>

          <p style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            Мы ищем будущих лидеров, предпринимателей и создателей.
            Заполни анкету — наш ИИ-ассистент поможет комиссии увидеть твой настоящий потенциал.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: '13px 32px', fontSize: 15, borderRadius: 10 }}>
                Подать заявку →
              </button>
            </Link>
            <a href="#how">
              <button className="btn-secondary" style={{ padding: '13px 32px', fontSize: 15, borderRadius: 10 }}>
                Как это работает
              </button>
            </a>
          </div>

          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {features.map(f => (
              <div key={f.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 140 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Шаги */}
      <section id="how" style={{
        background: '#fff',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '56px 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Как проходит отбор
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 36 }}>
            От регистрации до решения — всё онлайн
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
            {steps.map((s, i) => (
              <div key={i} className="card" style={{ padding: '20px 16px', textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '56px 24px', textAlign: 'center', background: 'var(--green-light)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Готов подать заявку?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
            Дедлайн подачи заявок: <strong style={{ color: 'var(--text)' }}>5 апреля 2026, 23:59</strong>
          </p>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '13px 32px', fontSize: 15, borderRadius: 10 }}>
              Начать анкету →
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}