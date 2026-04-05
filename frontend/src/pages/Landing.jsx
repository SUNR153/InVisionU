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

const whyItems = [
  '100% грантовое обучение — никаких скрытых платежей',
  'Объективный AI-отбор без предвзятости и блата',
  'Реальный опыт от практиков индустрии',
]

const bachItems = [
  'Технологическое предпринимательство',
  'Продуктовый дизайн и UX',
  'Data Science и AI',
  'Digital Marketing',
]

export default function Landing() {
  return (
    <div style={{ background: '#fff', color: '#000', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', background: 'linear-gradient(135deg, var(--green-light) 0%, #fff 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '5px 14px',
            background: 'var(--green-light)', color: 'var(--green-dark)',
            borderRadius: 99, marginBottom: 24, fontWeight: 600,
            border: '1px solid var(--green-100)',
          }}>
            🎓 100% грантовое обучение от inDrive
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Стань частью<br />
            <span style={{ color: 'var(--green-dark)' }}>inVision University</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.75, maxWidth: 540, margin: '0 auto 36px' }}>
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

          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {features.map(f => (
              <div key={f.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 140 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* О программе */}
      <section style={{ padding: '80px 24px', background: '#fff', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>О программе</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444', marginBottom: 24 }}>
              inVision University — образовательная программа от inDrive для молодых казахстанцев, которые хотят изменить мир через технологии и предпринимательство.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#444' }}>
              Мы ищем людей с потенциалом, а не только с высокими оценками. Наш AI-ассистент помогает комиссии увидеть твои настоящие качества.
            </p>
          </div>
          <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Направления бакалавриата</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {bachItems.map((item, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: i < bachItems.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Почему inVision */}
      <section style={{ padding: '64px 24px', background: '#d4f08d' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 36, textAlign: 'center' }}>Почему inVision U?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {whyItems.map((item, i) => (
              <div key={i} style={{ fontSize: 18, fontWeight: 600, paddingLeft: 20, borderLeft: '4px solid #000' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Шаги */}
      <section id="how" style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Как проходит отбор</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 40 }}>
            От регистрации до решения — всё онлайн
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
            {steps.map((s, i) => (
              <div key={i} className="card" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--green-light)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Готов подать заявку?</h2>
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

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Контакты</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.8 }}>
              Телефон: <span style={{ color: '#d4f08d' }}>+7 771 070 73 70</span><br />
              Email: <span style={{ color: '#d4f08d' }}>info@invisionu.education</span>
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Адрес</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.8 }}>Алматы, Казахстан</p>
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Режим работы</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.8 }}>09:00 — 18:00</p>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: '40px auto 0', paddingTop: 24, borderTop: '1px solid #333', fontSize: 13, color: '#666', textAlign: 'center' }}>
          © 2026 inVision U. Все права защищены.
        </div>
      </footer>
    </div>
  )
}