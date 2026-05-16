import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { id: 'Dashboard',   icon: '📊', label: 'Home' },
  { id: 'New Survey',  icon: '➕', label: 'Survey' },
  { id: 'Responses',   icon: '📋', label: 'Responses' },
  { id: 'Analytics',   icon: '📈', label: 'Analytics' },
  { id: 'Settings',    icon: '⚙️',  label: 'Settings' },
]

const SECTIONS = [
  { id: 'profile',       label: 'Farmer Profile',  icon: '👨‍🌾' },
  { id: 'awareness',     label: 'Awareness',        icon: '💡' },
  { id: 'accessibility', label: 'Accessibility',    icon: '🗺️' },
  { id: 'adoption',      label: 'Adoption',         icon: '🌱' },
  { id: 'usage',         label: 'Fertilizer Use',   icon: '⚖️' },
  { id: 'perception',    label: 'Perception',        icon: '🧠' },
]

export default function Layout({ active, setActive, user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const mob = isMobile

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#fdfbf7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg, #1a6b3c 0%, #114d2a 100%)',
        padding: `0 ${mob ? 16 : 28}px`, height: mob ? 56 : 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(26,107,60,0.25)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {mob && (
            <button className="tap" onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, padding: '4px', lineHeight: 1 }}>
              ☰
            </button>
          )}

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: mob ? 36 : 46, height: mob ? 36 : 46,
              background: '#fff', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: mob ? 20 : 24, boxShadow:'0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <span className="leaf">🌱</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontFamily: "'Crimson Pro',serif", fontSize: mob ? 20 : 26, fontWeight: 800, lineHeight: 1, letterSpacing:0.5 }}>
                SOILSENSE
              </div>
              {!mob && <div style={{ color: '#dcfce7', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginTop:2 }}>
                SIT Tumakuru Research Study
              </div>}
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        {!mob && (
          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className="tap" onClick={() => setActive(item.id)}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13,
                  color: active === item.id ? '#fff' : '#dcfce7',
                  fontWeight: active === item.id ? 700 : 500,
                  background: active === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}>
                {item.icon} {item.id}
              </div>
            ))}
          </nav>
        )}

        {/* User context */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!mob && (
              <div style={{ textAlign:'right' }}>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{user.name}</div>
                <div style={{ color: '#dcfce7', fontSize: 10, opacity:0.8 }}>MBA Student · SIT</div>
              </div>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#fff', border: '2px solid #dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#1a6b3c',
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={onLogout} className="tap"
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: 10, padding: '6px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}>
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <>
          <div className="overlay" onClick={() => setMenuOpen(false)} />
          <div className="drawer slide-in" style={{ background:'#fff', borderRight:'3px solid #1a6b3c' }}>
            <div style={{ background: 'linear-gradient(135deg,#1a6b3c,#114d2a)', padding: '30px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ color: '#fff', fontFamily: "'Crimson Pro',serif", fontSize: 24, fontWeight: 800 }}>SOILSENSE</div>
                <button onClick={() => setMenuOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, fontSize: 16 }}>✕</button>
              </div>
              <div style={{ color: '#dcfce7', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>SIT TUMAKURU · MBA</div>
            </div>

            <div style={{ padding: '20px 0' }}>
              {NAV_ITEMS.map(item => (
                <div key={item.id} className="tap"
                  onClick={() => { setActive(item.id); setMenuOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
                    background: active === item.id ? '#f0faf4' : 'transparent',
                    color: active === item.id ? '#1a6b3c' : '#374151',
                    fontSize: 15, fontWeight: active === item.id ? 700 : 500,
                  }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>{item.id}
                </div>
              ))}
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #f0faf4' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>Questionnaire Sections</div>
              {SECTIONS.map((s) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px', marginBottom: 8, borderRadius: 12,
                  background: '#f9fafb', border: '1px solid #f0f4f0'
                }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '24px' }}>
              <button className="btn-primary" onClick={() => { setActive('New Survey'); setMenuOpen(false) }}>
                ＋ Create New Survey
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop sidebar */}
        {!mob && (
          <aside style={{
            width: 250, background: '#fff',
            borderRight: '2px solid #f0f4f0', padding: '30px 20px',
            display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0,
            boxShadow: '4px 0 15px rgba(26,107,60,0.02)'
          }}>
            <div style={{ fontSize: 10, color: '#8d6e63', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Survey Modules</div>
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="fade-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12,
                  background: i === 0 ? '#f0faf4' : 'transparent',
                  border: i === 0 ? '1.5px solid #d1fae5' : '1.5px solid transparent',
                  animationDelay: `${i * 0.05}s`
                }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ fontSize: 14, color: i === 0 ? '#1a6b3c' : '#374151', fontWeight: i === 0 ? 700 : 500 }}>{s.label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding:'20px', background:'#fdfbf7', borderRadius:16, border:'1.5px solid #f5deb3', textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🎓</div>
              <div style={{ fontSize:11, color:'#8d6e63', fontWeight:700 }}>SIT TUMAKURU</div>
              <div style={{ fontSize:9, color:'#9ca3af' }}>MBA Research Project</div>
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main style={{ flex: 1, padding: mob ? '20px 16px 100px' : '40px 48px', overflowY: 'auto', minHeight: 0 }}>
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {mob && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '2px solid #f0f4f0',
          display: 'flex', paddingBottom: 'env(safe-area-inset-bottom,8px)',
          zIndex: 150, boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
        }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} className="tap"
              onClick={() => setActive(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: item.id === 'New Survey' ? '8px 4px' : '12px 4px 8px',
                color: active === item.id ? '#1a6b3c' : '#9ca3af',
              }}>
              {item.id === 'New Survey'
                ? <div style={{
                    background: '#1a6b3c', color: '#fff', borderRadius: '50%',
                    width: 48, height: 48, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 24, marginTop: -20,
                    boxShadow: '0 8px 20px rgba(26,107,60,0.3)', border: '4px solid #fff'
                  }}>＋</div>
                : <span style={{ fontSize: 22, lineHeight: 1, marginBottom: 4 }}>{item.icon}</span>
              }
              {item.id !== 'New Survey' && (
                <span style={{ fontSize: 10, fontWeight: active === item.id ? 800 : 500 }}>{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
    </div>
  )
}
