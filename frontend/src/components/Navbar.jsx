import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'
import { authApi } from '../api/client'
import { useTranslation } from 'react-i18next' // i18next импорты

export default function Navbar() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation() // i18n құралдары
  const loggedIn = auth.isLoggedIn()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  async function handleLogout() {
    try {
      await authApi.logout(auth.getRefresh())
    } catch {}
    auth.clear()
    navigate('/login')
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 60px',
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: '900', color: '#000', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          inVision <span style={{ fontWeight: '400' }}>U</span>
        </Link>
        <span style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', marginTop: '-2px' }}>
          initiative of Arsen Tomsky <br /> powered by inDrive
        </span>
      </div>

      <div style={{ display: 'flex', gap: '40px' }}>
        <button onClick={() => scrollToSection('about')} style={navItemStyle}>{t('about')}</button>
        <button onClick={() => scrollToSection('foundation')} style={navItemStyle}>Foundation</button>
        <button onClick={() => scrollToSection('bachelor')} style={navItemStyle}>Бакалавриат</button>
        <button onClick={() => scrollToSection('contacts')} style={navItemStyle}>Контакты</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        {/* Тіл ауыстыру бөлімі */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#000', cursor: 'pointer', display: 'flex', gap: '5px' }}>
          <span 
            onClick={() => changeLanguage('kz')} 
            style={{ color: i18n.language === 'kz' ? '#000' : '#aaa' }}
          >KZ</span>
          <span style={{ color: '#aaa' }}>|</span>
          <span 
            onClick={() => changeLanguage('ru')} 
            style={{ color: i18n.language === 'ru' ? '#000' : '#aaa' }}
          >RU</span>
          <span style={{ color: '#aaa' }}>|</span>
          <span 
            onClick={() => changeLanguage('en')} 
            style={{ color: i18n.language === 'en' ? '#000' : '#aaa' }}
          >EN</span>
        </div>

        {loggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/cabinet" style={{ fontSize: '13px', color: '#000', textDecoration: 'none', fontWeight: '600' }}>
              Мой кабинет
            </Link>
            <button onClick={handleLogout} style={authButtonStyle}>Выйти</button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={authButtonStyle}>{t('login')}</button>
          </Link>
        )}
      </div>
    </nav>
  )
}

const navItemStyle = {
  background: 'none',
  border: 'none',
  fontSize: '13px',
  fontWeight: '700',
  color: '#000',
  textTransform: 'uppercase',
  cursor: 'pointer',
  padding: '5px 0',
  letterSpacing: '0.5px'
};

const authButtonStyle = {
  background: '#000',
  color: '#fff',
  border: 'none',
  padding: '10px 24px',
  borderRadius: '2px',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: '0.2s opacity'
};