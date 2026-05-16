import { useState, useEffect } from 'react'
import { fetchStats } from '../api'

const STATUS_COLOR = { Complete: '#1a6b3c', Pending: '#d97706', Draft: '#6b7280' }
const STATUS_BG    = { Complete: '#dcfce7', Pending: '#fef3c7', Draft: '#f3f4f6' }

function StatCard({ label, value, icon, delta, delay, color }) {
  return (
    <div className="card fade-up" style={{
      position: 'relative', overflow: 'hidden', animationDelay: delay, borderLeft: `5px solid ${color || '#1a6b3c'}`
    }}>
      <div style={{ position: 'absolute', right: -8, bottom: -8, fontSize: 42, opacity: 0.05 }}>🌾</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 36, fontWeight: 800, color: '#1a6b3c', lineHeight: 1 }}>
            {value ?? '0'}
          </div>
          <div style={{ fontSize: 12, color: color || '#1a6b3c', fontWeight: 700, marginTop: 6 }}>{delta}</div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: '#f0faf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, border: '1px solid #d1fae5'
        }}>{icon}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ setActive }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
      .then(r => setStats(r.data))
      .catch(() => setError('Could not load stats. Check backend connection.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 120 }} />
      ))}
      <div className="skeleton" style={{ gridColumn: 'span 2', height: 250 }} />
    </div>
  )

  const { totals = {}, awareness = {}, recentFarmers = [] } = stats || {}

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Branding Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
             <span style={{ padding:'2px 8px', background:'#1a6b3c', color:'#fff', borderRadius:4, fontSize:10, fontWeight:900 }}>SOILSENSE</span>
             <span style={{ fontSize:10, fontWeight:700, color:'#8d6e63' }}>OFFICIAL DASHBOARD</span>
          </div>
          <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 36, fontWeight: 800, color: '#1a6b3c', lineHeight: 1 }}>
            SIT Tumakuru Research
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4, fontWeight:500 }}>
            Real-time survey tracking for Soil Testing Adoption Study
          </p>
        </div>
        <button className="btn-primary" onClick={() => setActive('New Survey')} style={{ width: 'auto', height: 48, padding: '0 24px', fontSize: 14 }}>
          ＋ Start New Survey
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Farmers" value={totals.total} icon="👨‍🌾" delta="Total Reach" delay="0s" color="#1a6b3c" />
        <StatCard label="Completed" value={totals.Complete} icon="✅" delta={`${totals.total ? Math.round((totals.Complete/totals.total)*100) : 0}% success`} delay="0.1s" color="#4ecb85" />
        <StatCard label="Avg Awareness" value={`${awareness.awareOfSoilTesting}%`} icon="💡" delta="Regional Awareness" delay="0.2s" color="#d97706" />
        <StatCard label="Soil Tested" value={`${awareness.hasTested}%`} icon="🧪" delta="Adoption Rate" delay="0.3s" color="#3b82f6" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, marginBottom: 24 }}>
        {/* Left Column: Awareness Metrics */}
        <div className="card fade-up" style={{ animationDelay: '0.4s' }}>
          <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontWeight:800, color:'#1a6b3c', marginBottom:20 }}>Key Indicators</h3>
          {[
            { label: 'Aware of Soil Testing', pct: awareness.awareOfSoilTesting || 0, color:'#1a6b3c' },
            { label: 'Actually Tested Soil', pct: awareness.hasTested || 0, color:'#4ecb85' },
            { label: 'Follow Recommendations', pct: awareness.usesReports || 0, color:'#d97706' },
            { label: 'Facility Access Satisfied', pct: awareness.noBarriers || 0, color:'#3b82f6' }
          ].map(item => (
            <div key={item.label} style={{ marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{item.label}</span>
                <span style={{ fontSize:12, fontWeight:800, color:item.color }}>{item.pct}%</span>
              </div>
              <div style={{ height:8, background:'#f0faf4', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${item.pct}%`, background:item.color, borderRadius:4, transition:'width 1s ease' }} />
              </div>
            </div>
          ))}
          <button className="tap" onClick={() => setActive('Analytics')} 
            style={{ width:'100%', marginTop:10, padding:'10px', background:'#fdfbf7', border:'1.5px solid #d1fae5', borderRadius:10, fontSize:12, fontWeight:700, color:'#1a6b3c' }}>
            View Full Analytics →
          </button>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="card fade-up" style={{ animationDelay: '0.5s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 800, color: '#1a6b3c' }}>
              Recent Submissions
            </h3>
            <button onClick={() => setActive('Responses')} style={{ background:'none', border:'none', color:'#1a6b3c', fontSize:13, fontWeight:700, cursor:'pointer' }}>View All</button>
          </div>
          
          {recentFarmers.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af' }}>No surveys submitted today.</div>
          ) : recentFarmers.map((f, i) => (
            <div key={f._id} style={{ 
              display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', 
              borderBottom: i < recentFarmers.length - 1 ? '1px solid #f0faf4' : 'none' 
            }}>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'#f0faf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👨‍🌾</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#374151' }}>{f.farmerName}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{f.village} · {f.q5_mainCrop}</div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <span className="badge" style={{ background: STATUS_BG[f.status], color: STATUS_COLOR[f.status], marginBottom:4 }}>{f.status}</span>
                <div style={{ fontSize:10, color:'#9ca3af' }}>{new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="card fade-up" style={{ background:'linear-gradient(135deg, #1a6b3c, #114d2a)', color:'#fff', border:'none', animationDelay:'0.6s' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h4 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:700 }}>Project Objectives</h4>
            <p style={{ fontSize:12, opacity:0.8, marginTop:4, maxWidth:500 }}>
              To identify accessibility barriers, assess awareness levels, and examine adoption patterns of soil testing among rural farmers in Tumkur district.
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:24 }}>🎓</div>
            <div style={{ fontSize:10, fontWeight:900, letterSpacing:1 }}>SIT TUMAKURU MBA</div>
          </div>
        </div>
      </div>
    </div>
  )
}
