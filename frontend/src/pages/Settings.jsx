export default function Settings({ user, onLogout }) {
  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 30, fontWeight: 700, color: '#1a6b3c' }}>Settings</h1>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Platform configuration and preferences</p>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="card fade-up" style={{ marginBottom: 16, background: 'linear-gradient(135deg,#1a6b3c,#2d8a56)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0
            }}>
              {user.name?.[0]?.toUpperCase() || '👤'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', color: '#7fffc4',
                  padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700
                }}>
                  {user.role === 'admin' ? '🛡️ Admin' : '👨‍🌾 Field Officer'}
                </span>
              </div>
            </div>
            <button onClick={onLogout} className="tap"
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', borderRadius: 10, padding: '9px 16px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif"
              }}>
              ⬅ Logout
            </button>
          </div>
        </div>
      )}

      {[
        {
          title: 'Survey Configuration', icon: '📋', items: [
            { label: 'Auto-save drafts',          desc: 'Automatically save survey progress every 30 seconds', toggle: true,  on: true  },
            { label: 'GPS location capture',       desc: 'Capture GPS coordinates during field surveys',         toggle: true,  on: true  },
            { label: 'Offline mode',              desc: 'Cache surveys locally when no internet is available',   toggle: true,  on: true  },
            { label: 'Require all sections',       desc: 'Make all 5 sections mandatory before submission',      toggle: false, on: false },
          ]
        },
        {
          title: 'Data & Privacy', icon: '🔒', items: [
            { label: 'Data retention period', desc: '3 years (as per government policy)', toggle: false },
            { label: 'Export format',         desc: 'Default: Excel (.xlsx)',             toggle: false },
            { label: 'Language',              desc: 'English / ಕನ್ನಡ (switchable)',       toggle: false },
          ]
        },
        {
          title: 'About', icon: 'ℹ️', items: [
            { label: 'Version',     desc: 'Mitti Mitra v1.0.0',                   toggle: false },
            { label: 'Backend',     desc: 'Node.js + Express + MongoDB Atlas',    toggle: false },
            { label: 'Frontend',    desc: 'React 18 + Vite',                      toggle: false },
            { label: 'Database',    desc: 'MongoDB Atlas (Cloud)',                 toggle: false },
          ]
        },
      ].map(section => (
        <div key={section.title} className="card fade-up" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1.5px solid #f0faf4' }}>
            <div style={{ fontSize: 22 }}>{section.icon}</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 19, fontWeight: 700, color: '#1a6b3c' }}>{section.title}</div>
          </div>
          {section.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: i < section.items.length - 1 ? '1px solid #f0faf4' : 'none'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.desc}</div>
              </div>
              {item.toggle && (
                <div style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: item.on ? '#1a6b3c' : '#d1d5db',
                  position: 'relative', cursor: 'pointer', flexShrink: 0
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: item.on ? 21 : 3, width: 16, height: 16,
                    background: '#fff', borderRadius: '50%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s'
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Connection status */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#f0faf4,#dcfce7)', border: '1.5px solid #bbf7d0' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 18, fontWeight: 700, color: '#1a6b3c', marginBottom: 12 }}>
          🌐 System Status
        </div>
        {[
          { label: 'MongoDB Atlas',    status: 'Connected',  color: '#1a6b3c', bg: '#dcfce7' },
          { label: 'Backend API',      status: 'Running',    color: '#1a6b3c', bg: '#dcfce7' },
          { label: 'React Frontend',   status: 'Active',     color: '#1a6b3c', bg: '#dcfce7' },
          { label: 'GPS Module',       status: 'Ready',      color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>{s.label}</span>
            <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
