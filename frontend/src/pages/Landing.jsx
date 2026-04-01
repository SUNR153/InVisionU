import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const steps = [
  { n: 1, title: 'Заполни анкету', desc: 'Личные данные, мотивация и достижения. Займёт ~15 минут.' },
  { n: 2, title: 'Напиши эссе', desc: 'Расскажи свою историю своими словами — без шаблонов.' },
  { n: 3, title: 'Получи решение', desc: 'Приёмная комиссия рассмотрит заявку в течение 2 недель.' },
]

export default function Landing() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '64px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: 12,
          padding: '4px 14px',
          background: 'var(--green-light)',
          color: 'var(--green-dark)',
          borderRadius: 99,
          marginBottom: 20,
          fontWeight: 500,
        }}>
          100% грантовое обучение от inDrive
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.25, marginBottom: 16 }}>
          Стань частью<br />inVision University
        </h1>

        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
          Мы ищем будущих лидеров, предпринимателей и создателей.
          Заполни анкету — наш ИИ-ассистент поможет комиссии увидеть твой настоящий потенциал.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register">
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Подать заявку →
            </button>
          </Link>
          <a href="#how">
            <button className="btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Как это работает
            </button>
          </a>
        </div>
      </section>

      {/* Как работает */}
      <section id="how" style={{
        background: '#fff',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 32, textAlign: 'center' }}>
            Как проходит отбор
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {steps.map(s => (
              <div key={s.n} className="card" style={{ padding: 20 }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: 'var(--green-light)',
                  color: 'var(--green-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14,
                  marginBottom: 12,
                }}>
                  {s.n}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
          Дедлайн подачи заявок: <strong style={{ color: 'var(--text)' }}>5 апреля 2025, 23:59</strong>
        </p>
        <Link to="/register">
          <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
            Начать анкету
          </button>
        </Link>
      </section>
    </div>
  )
}
