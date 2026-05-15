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
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#f0faf4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg,#1a6b3c 0%,#2d8a56 55%,#3aad6e 100%)',
        padding: `0 ${mob ? 16 : 28}px`, height: mob ? 56 : 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 24px rgba(26,107,60,0.35)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {mob && (
          <button className="tap" onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, padding: '4px 6px', lineHeight: 1 }}>
            ☰
          </button>
        )}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: mob ? 34 : 42, height: mob ? 34 : 42,
            background: 'rgba(255,255,255,0.15)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: mob ? 17 : 22, border: '1.5px solid rgba(255,255,255,0.3)'
          }}>
            <span className="leaf">🌿</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontFamily: "'Crimson Pro',serif", fontSize: mob ? 19 : 23, fontWeight: 700, lineHeight: 1 }}>
              Mitti Mitra
            </div>
            {!mob && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Soil Research Platform
            </div>}
          </div>
        </div>

        {/* Desktop nav */}
        {!mob && (
          <nav style={{ display: 'flex', gap: 2 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} className="tap" onClick={() => setActive(item.id)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12,
                  color: active === item.id ? '#fff' : 'rgba(255,255,255,0.72)',
                  fontWeight: active === item.id ? 600 : 400,
                  background: active === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                }}>
                {item.icon} {item.id}
              </div>
            ))}
          </nav>
        )}

        {/* Right: Live + user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: 20 }}>
            <div className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#7fffc4' }} />
            {!mob && <span style={{ color: '#7fffc4', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>}
          </div>

          {/* User avatar + name */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
                flexShrink: 0
              }}>
                {user.name?.[0]?.toUpperCase() || '👤'}
              </div>
              {!mob && (
                <div>
                  <div style={{ color: '#fff', fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
                    {user.name?.split(' ')[0]}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, letterSpacing: 0.5 }}>
                    {user.role === 'admin' ? '🛡️ Admin' : '👨‍🌾 Field Officer'}
                  </div>
                </div>
              )}
              {/* Logout button */}
              <button onClick={onLogout} className="tap"
                style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.8)', borderRadius: 8, padding: '5px 10px',
                  fontSize: 11, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600, whiteSpace: 'nowrap'
                }}>
                {mob ? '⬅' : '⬅ Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <>
          <div className="overlay" onClick={() => setMenuOpen(false)} />
          <div className="drawer slide-in">
            <div style={{ background: 'linear-gradient(135deg,#1a6b3c,#2d8a56)', padding: '24px 18px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ color: '#fff', fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700 }}>🌿 Mitti Mitra</div>
                <button onClick={() => setMenuOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', padding: '5px 10px', borderRadius: 20, width: 'fit-content' }}>
                <div className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7fffc4' }} />
                <span style={{ color: '#7fffc4', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
              </div>
            </div>

            <div style={{ padding: '10px 0' }}>
              {NAV_ITEMS.map(item => (
                <div key={item.id} className="tap"
                  onClick={() => { setActive(item.id); setMenuOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    background: active === item.id ? '#f0faf4' : 'transparent',
                    borderLeft: active === item.id ? '4px solid #1a6b3c' : '4px solid transparent',
                    color: active === item.id ? '#1a6b3c' : '#374151',
                    fontSize: 14, fontWeight: active === item.id ? 600 : 400,
                  }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>{item.id}
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 18px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Questionnaire</div>
              {SECTIONS.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', marginBottom: 6, borderRadius: 10,
                  background: i === 0 ? '#dcfce7' : '#f9fafb',
                  border: i === 0 ? '1.5px solid #bbf7d0' : '1.5px solid transparent'
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: i === 0 ? '#1a6b3c' : '#374151', fontWeight: i === 0 ? 600 : 400 }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '10px 18px 24px' }}>
              <div className="tap btn-primary" onClick={() => { setActive('New Survey'); setMenuOpen(false) }}>
                ＋ Start New Survey
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop sidebar */}
        {!mob && (
          <aside style={{
            width: 220, background: '#fff',
            borderRight: '1px solid #d1fae5', padding: '26px 14px',
            display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
            boxShadow: '2px 0 14px rgba(26,107,60,0.06)'
          }}>
            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Sections</div>
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="tap fade-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                  background: i === 0 ? '#dcfce7' : 'transparent',
                  border: i === 0 ? '1.5px solid #bbf7d0' : '1.5px solid transparent',
                  animationDelay: `${i * 0.07}s`
                }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontSize: 13, color: i === 0 ? '#1a6b3c' : '#374151', fontWeight: i === 0 ? 600 : 400 }}>{s.label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div className="tap btn-primary" onClick={() => setActive('New Survey')}>
              ＋ New Survey
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main style={{ flex: 1, padding: mob ? '18px 14px 88px' : '30px 32px', overflowY: 'auto', minHeight: 0 }}>
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {mob && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1.5px solid #d1fae5',
          display: 'flex', paddingBottom: 'env(safe-area-inset-bottom,6px)',
          zIndex: 150, boxShadow: '0 -4px 20px rgba(26,107,60,0.1)'
        }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} className="tap"
              onClick={() => setActive(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: item.id === 'New Survey' ? '6px 4px 8px' : '10px 4px 8px',
                color: active === item.id ? '#1a6b3c' : '#9ca3af',
              }}>
              {item.id === 'New Survey'
                ? <div style={{
                    background: '#1a6b3c', color: '#fff', borderRadius: '50%',
                    width: 44, height: 44, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, marginTop: -16,
                    boxShadow: '0 4px 16px rgba(26,107,60,0.35)', border: '3px solid #f0faf4'
                  }}>➕</div>
                : <span style={{ fontSize: 20, lineHeight: 1, marginBottom: 3 }}>{item.icon}</span>
              }
              {item.id !== 'New Survey' && (
                <span style={{ fontSize: 9, fontWeight: active === item.id ? 700 : 400 }}>{item.label}</span>
              )}
              {active === item.id && item.id !== 'New Survey' && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1a6b3c', marginTop: 2 }} />
              )}
            </div>
          ))}
        </nav>
      )}
    </div>
  )
}
