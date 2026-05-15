import { useState, useEffect } from 'react'
import { fetchStats, fetchFarmers } from '../api'

const STATUS_COLOR = { Complete: '#1a6b3c', Pending: '#d97706', Draft: '#6b7280' }
const STATUS_BG    = { Complete: '#dcfce7', Pending: '#fef3c7', Draft: '#f3f4f6' }

function StatCard({ label, value, icon, delta, delay }) {
  return (
    <div className="card fade-up" style={{
      position: 'relative', overflow: 'hidden', animationDelay: delay
    }}>
      <div style={{ position: 'absolute', right: -8, bottom: -8, fontSize: 42, opacity: 0.05 }}>🌿</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 34, fontWeight: 700, color: '#1a6b3c', lineHeight: 1 }}>
            {value ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: '#4ecb85', fontWeight: 600, marginTop: 4 }}>{delta}</div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: '#f0faf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, border: '1px solid #d1fae5'
        }}>{icon}</div>
      </div>
    </div>
  )
}

function BarChart({ data }) {
  return (
    <div className="card fade-up" style={{ animationDelay: '0.13s' }}>
      <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 700, color: '#1a6b3c', marginBottom: 2 }}>
        Key Metrics
      </div>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>% of surveyed farmers</div>
      {data.map((d, i) => (
        <div key={d.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{d.label}</span>
            <span style={{ fontSize: 12, color: '#1a6b3c', fontWeight: 700 }}>{d.pct}%</span>
          </div>
          <div style={{ height: 10, background: '#f0faf4', borderRadius: 8, overflow: 'hidden' }}>
            <div className="bar-fill" style={{
              '--w': `${d.pct}%`, height: '100%', width: `${d.pct}%`,
              background: 'linear-gradient(90deg,#1a6b3c,#4ecb85)',
              borderRadius: 8, animationDelay: `${i * 0.12}s`
            }} />
          </div>
        </div>
      ))}
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
      .catch(() => setError('Could not load stats. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 100 }} />
      ))}
    </div>
  )

  if (error) return (
    <div style={{
      background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: 14,
      padding: 24, color: '#dc2626', fontSize: 14, textAlign: 'center'
    }}>
      ❌ {error}
      <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
        Make sure your backend is running on <code>http://localhost:5000</code>
      </div>
    </div>
  )

  const { totals = {}, villages = 0, awareness = {}, recentFarmers = [] } = stats || {}

  const chartData = [
    { label: 'Aware of Soil Testing', pct: awareness.awareOfSoilTesting ?? 0 },
    { label: 'Have Tested Soil',       pct: awareness.hasTested ?? 0 },
    { label: 'Use Reports',            pct: awareness.usesReports ?? 0 },
    { label: 'No Barriers',            pct: awareness.noBarriers ?? 0 },
  ]

  const progressSections = [
    { label: 'Farmer Profile',  pct: 100 },
    { label: 'Awareness',       pct: 91 },
    { label: 'Accessibility',   pct: 88 },
    { label: 'Adoption',        pct: 76 },
    { label: 'Dichotomous',     pct: 72 },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 32, fontWeight: 700, color: '#1a6b3c', lineHeight: 1.1 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            Tumkur District · {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', padding: '5px 10px', borderRadius: 20 }}>
            <div className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a6b3c' }} />
            <span style={{ color: '#1a6b3c', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-outline" onClick={async () => {
              try {
                const res = await fetchFarmers({ limit: 10000 })
                const data = res.data.farmers
                if (!data.length) return
                
                const headers = Object.keys(data[0]).filter(k => k !== 'photo' && k !== '__v')
                const csv = [
                  headers.join(','),
                  ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
                ].join('\n')
                
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.setAttribute('href', url)
                a.setAttribute('download', 'all_farmers_data.csv')
                a.click()
              } catch (e) { console.error(e) }
            }} style={{ padding: '5px 12px', fontSize: 10 }}>
              📊 Full Export
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard label="Surveyed"  value={totals.total?.toLocaleString()}    icon="👥"  delta="+2 today"       delay="0s" />
        <StatCard label="Completed" value={totals.completed?.toLocaleString()} icon="✅"  delta={`${totals.total ? Math.round((totals.completed/totals.total)*100) : 0}%`} delay="0.06s" />
        <StatCard label="Pending"   value={totals.pending?.toLocaleString()}   icon="⏳"  delta={`${totals.total ? Math.round((totals.pending/totals.total)*100) : 0}%`}  delay="0.12s" />
        <StatCard label="Villages"  value={villages}                           icon="📍"  delta="2 Taluks"       delay="0.18s" />
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 16 }}>
        <BarChart data={chartData} />
      </div>

      {/* Recent responses */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 700, color: '#1a6b3c' }}>
            Recent Responses
          </div>
          <div className="tap" onClick={() => setActive('Responses')}
            style={{ fontSize: 12, color: '#4ecb85', fontWeight: 600 }}>
            View all →
          </div>
        </div>
        {recentFarmers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
            No surveys submitted yet. <span className="tap" style={{ color: '#1a6b3c', fontWeight: 600 }} onClick={() => setActive('New Survey')}>Start one →</span>
          </div>
        ) : recentFarmers.map((f, i) => (
          <div key={f._id} className="tap" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 0',
            borderBottom: i < recentFarmers.length - 1 ? '1px solid #f0faf4' : 'none'
          }} onClick={() => setActive('Responses')}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#f0faf4',
                border: '1.5px solid #d1fae5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 15, flexShrink: 0
              }}>👨‍🌾</div>
              <div>
                <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{f.farmerName}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{f.village} · {f.mainCrop}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span className="badge" style={{ background: STATUS_BG[f.status], color: STATUS_COLOR[f.status] }}>
                {f.status}
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>
                {new Date(f.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Survey Progress card */}
      <div className="fade-up" style={{
        background: 'linear-gradient(135deg,#1a6b3c 0%,#2d8a56 100%)',
        borderRadius: 16, padding: '22px 20px',
        boxShadow: '0 8px 28px rgba(26,107,60,0.28)',
        position: 'relative', overflow: 'hidden',
        marginBottom: 18, animationDelay: '0.3s'
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
          Survey Progress
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 18 }}>
          Target: 1,500 farmers · Tumkur Rural & Gubbi
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Overall Completion</span>
            <span style={{ fontSize: 12, color: '#7fffc4', fontWeight: 700 }}>
              {totals.total ? Math.min(Math.round((totals.total / 1500) * 100), 100) : 0}%
            </span>
          </div>
          <div style={{ height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${totals.total ? Math.min(Math.round((totals.total / 1500) * 100), 100) : 0}%`,
              background: 'linear-gradient(90deg,#7fffc4,#4ecb85)', borderRadius: 6,
              transition: 'width 1s ease'
            }} />
          </div>
        </div>
        {progressSections.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', width: 110, flexShrink: 0 }}>{item.label}</div>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: item.pct === 100 ? '#7fffc4' : 'rgba(255,255,255,0.5)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', width: 32, textAlign: 'right' }}>{item.pct}%</div>
          </div>
        ))}
      </div>

      {/* Status tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['📍 GPS: Active', '💾 Auto-Save: ON', '📶 Offline: Ready'].map(tag => (
          <div key={tag} style={{
            background: '#fff', border: '1px solid #d1fae5',
            padding: '6px 12px', borderRadius: 20,
            fontSize: 11, color: '#1a6b3c', fontWeight: 500
          }}>{tag}</div>
        ))}
      </div>
    </div>
  )
}
