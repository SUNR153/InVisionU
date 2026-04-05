import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import foundationPhoto from '../assets/foundation-photo.jpg.png'
import bachelorPhoto from '../assets/bachelor-photo.jpg'

export default function Landing() {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language.toUpperCase()

  return (
    <div style={{ background: '#fff', color: '#000', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <section style={{ padding: '160px 20px 180px', background: '#f9f9f9', textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', marginBottom: '48px', textTransform: 'uppercase' }}>
            {t('heroTitle1')}<br />
            <span style={{ color: '#000' }}>{t('heroTitle2')}</span>
          </h1>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#000', color: '#fff', padding: '20px 50px', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '2px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('applyBtn')}
            </button>
          </Link>
        </div>
      </section>

      <section id="about" style={{ padding: '180px 60px 120px', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '100px', marginBottom: '120px', alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '100px', fontWeight: '900', lineHeight: '0.8', margin: 0, minWidth: '350px' }}>
            {t('aboutTitle').toUpperCase()}
          </h2>
          <div style={{ flex: 1, borderLeft: '1px solid #000', paddingLeft: '60px' }}>
            <p style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '60px' }}>{t('aboutDesc')}</p>
            <h3 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '30px' }}>{t('whoTitle')}</h3>
            <p style={{ fontSize: '20px', lineHeight: '1.8' }}>{t('whoDesc')}</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '100px', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '25px', textTransform: 'uppercase' }}>{t('progTitle')}</h2>
          <p style={{ fontSize: '22px', fontWeight: '500', color: '#333' }}>{t('progSub')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #eee', paddingTop: '80px', marginBottom: '60px' }}>
          <div style={{ flex: 1, paddingRight: '60px', borderRight: '1px solid #eee' }}>
            <h4 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '30px' }}>{t('foundTitle')}</h4>
            <p style={{ fontSize: '19px', lineHeight: '1.7', color: '#444' }}>{t('foundDesc')}</p>
          </div>
          <div style={{ flex: 1, paddingLeft: '60px' }}>
            <h4 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '30px' }}>{t('bachTitle')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '19px', lineHeight: '2.5' }}>
              {(t('bachItems', { returnObjects: true }) || []).map((item, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ background: '#d4f08d', padding: '100px 60px', marginBottom: '100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '50px' }}>{t('whyTitle')}</h3>
          <div style={{ fontSize: '22px', fontWeight: '700', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <p style={{ margin: 0 }}>| {t('why1')}</p>
            <p style={{ margin: 0 }}>| {t('why2')}</p>
            <p style={{ margin: 0 }}>| {t('why3')}</p>
          </div>
        </div>
      </section>

      <section id="foundation" style={{ padding: '160px 60px', background: '#1a1a1a', color: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '60px', textTransform: 'uppercase', borderBottom: '2px solid #d4f08d', display: 'inline-block', paddingBottom: '10px' }}>
            {t('foundProgTitle')}
          </h2>

          <div style={{ display: 'flex', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
            <div style={{ flex: 1.2 }}>
              <p style={{ fontSize: '22px', lineHeight: '1.6', color: '#ccc', marginBottom: '50px' }}>{t('foundLongDesc')}</p>
              <h3 style={{ fontSize: '28px', marginBottom: '30px', color: '#d4f08d' }}>{t('learnTitle')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={{ borderLeft: '3px solid #d4f08d', paddingLeft: '25px' }}>
                  <h4 style={{ fontSize: '20px', marginBottom: '10px' }}>Academic English</h4>
                  <p style={{ fontSize: '15px', color: '#999' }}>{t('foundEnglishDesc')}</p>
                </div>
                <div style={{ borderLeft: '3px solid #d4f08d', paddingLeft: '25px' }}>
                  <h4 style={{ fontSize: '20px', marginBottom: '10px' }}>Mathematics & Logic</h4>
                  <p style={{ fontSize: '15px', color: '#999' }}>{t('foundMathDesc')}</p>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.8 }}>
              <img src={foundationPhoto} alt="Foundation" style={{ width: '100%', height: 'auto', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            </div>
          </div>

          <div style={{ background: '#d4f08d', color: '#000', padding: '60px', borderRadius: '4px', marginBottom: '100px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>{t('advTitle')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', textAlign: 'center' }}>
              <div><p style={{ fontSize: '18px', fontWeight: '700' }}>100% Grant</p></div>
              <div><p style={{ fontSize: '18px', fontWeight: '700' }}>Soft Skills</p></div>
              <div><p style={{ fontSize: '18px', fontWeight: '700' }}>Impact Focus</p></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '80px', paddingTop: '60px', borderTop: '1px solid #333' }}>
            <div style={{ flex: 1.2 }}>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>{t('stepTitle')}</h3>
              {(t('steps', { returnObjects: true }) || []).map((step, i) => (
                <p key={i} style={{ fontSize: '20px', color: '#ccc', marginBottom: '15px' }}>{step}</p>
              ))}
            </div>
            <div style={{ flex: 0.8, background: '#222', padding: '40px', borderRadius: '4px', alignSelf: 'start' }}>
              <h4 style={{ color: '#d4f08d', marginBottom: '15px', fontSize: '18px' }}>{t('deadline')}</h4>
              <p style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{t('deadlineDate')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="bachelor" style={{ padding: '160px 60px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '60px', textTransform: 'uppercase', borderBottom: '2px solid #000', display: 'inline-block', paddingBottom: '10px' }}>
            {t('bachProgTitle')}
          </h2>

          <div style={{ display: 'flex', gap: '80px', alignItems: 'center', marginBottom: '80px' }}>
            <div style={{ flex: 0.8 }}>
              <img src={bachelorPhoto} alt="Bachelor" style={{ width: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ flex: 1.2 }}>
              <p style={{ fontSize: '22px', lineHeight: '1.8', color: '#333', marginBottom: '40px' }}>{t('bachLongDesc')}</p>
              <h4 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>{t('studyDirections')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '18px', lineHeight: '2.2' }}>
                {(t('bachItems', { returnObjects: true }) || []).map((item, index) => (
                  <li key={index} style={{ borderLeft: '3px solid #d4f08d', paddingLeft: '20px', marginBottom: '10px' }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: '100px', padding: '60px', background: '#f9f9f9', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>{t('bachReqTitle')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
              <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>{t('bachReq1')}</p>
              <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>{t('bachReq2')}</p>
              <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6' }}>{t('bachReq3')}</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contacts" style={{ background: '#1a1a1a', color: '#fff', padding: '100px 60px', borderTop: '1px solid #333' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '60px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px' }}>{t('footerContact')}</h3>
            <p style={{ fontSize: '16px', color: '#aaa', lineHeight: '1.6' }}>{t('footerDesc')}</p>
          </div>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '20px' }}><strong>{t('phoneLabel')}:</strong><br /><span style={{ color: '#d4f08d' }}>+7 771 070 73 70</span><br /><span style={{ fontSize: '13px', color: '#888' }}>({t('whatsappNotice')})</span></p>
            <p style={{ marginBottom: '20px' }}><strong>{t('contactPerson')}</strong><br /><strong>{t('footerTime')}</strong> 09:00 - 18:00</p>
            <p><strong>Email:</strong><br /><span style={{ color: '#d4f08d' }}>info@invisionu.education</span></p>
          </div>
          <div><p style={{ fontSize: '16px', lineHeight: '1.8' }}><strong>{t('addressLabel')}</strong><br />{t('footerAddress')}</p></div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '80px auto 0', paddingTop: '30px', borderTop: '1px solid #333', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          © 2026 inVision U. {t('copyright')}
        </div>
      </footer>
    </div>
  )
}