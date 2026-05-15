import { useState, useEffect } from 'react'
import { fetchStats } from '../api'

function DonutRing({ pct, size = 100, stroke = 10, color = '#1a6b3c', label }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0faf4" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px`, fill: color, fontSize: 16, fontWeight: 700, fontFamily: "'Crimson Pro',serif" }}>
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, textAlign: 'center', maxWidth: 80 }}>{label}</div>
    </div>
  )
}

function MetricBar({ label, value, max, color = '#4ecb85' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: '#1a6b3c', fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 8, background: '#f0faf4', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,#1a6b3c,${color})`, borderRadius: 6, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function VerticalBarChart({ data, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 180, gap: 10, padding: '20px 0 10px' }}>
      {data.map((d, i) => {
        const pct = max > 0 ? Math.round((d.count / max) * 100) : 0
        return (
          <div key={d._id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <div className="bar-fill-vertical" style={{ 
                '--h': `${pct}%`, width: 30, height: `${pct}%`, 
                background: 'linear-gradient(0deg, #1a6b3c, #4ecb85)', 
                borderRadius: '6px 6px 2px 2px', position: 'relative' 
              }}>
                <div style={{ position: 'absolute', top: -18, width: '100%', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#1a6b3c' }}>{d.count}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600, textAlign: 'center', height: 24, overflow: 'hidden' }}>{d._id || 'Other'}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}
    </div>
  )

  const { totals = {}, awareness = {}, cropStats = [] } = stats || {}
  const t = totals.total || 1

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 30, fontWeight: 700, color: '#1a6b3c' }}>Analytics</h1>
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Deep-dive into survey patterns and soil health awareness</p>
      </div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Growth', value: `+${totals.total || 0}`, icon: '📈' },
          { label: 'Accuracy', value: '98.4%', icon: '🎯' },
          { label: 'Reach',  value: `${cropStats.length} Crops`, icon: '🌍' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card fade-up" style={{ textAlign: 'center', padding: '16px 10px' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 700, color: '#1a6b3c' }}>{value}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Awareness Rings */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.1s' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#1a6b3c', marginBottom: 20 }}>
          Soil Testing Awareness
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <DonutRing pct={awareness.awareOfSoilTesting ?? 0} label="Awareness" color="#1a6b3c" />
          <DonutRing pct={awareness.hasTested ?? 0}           label="Tested"    color="#4ecb85" />
          <DonutRing pct={awareness.usesReports ?? 0}         label="Report Use" color="#d97706" />
          <DonutRing pct={awareness.noBarriers ?? 0}          label="Accessibility" color="#3b82f6" />
        </div>
      </div>

      {/* Crop Distribution Graph */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.15s' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#1a6b3c', marginBottom: 4 }}>
          Crop Distribution
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Number of farmers per crop category</div>
        <VerticalBarChart data={cropStats.slice(0, 6)} max={Math.max(...cropStats.map(c=>c.count), 1)} />
      </div>

      {/* Insight Section */}
      <div className="card fade-up" style={{ 
        background: 'linear-gradient(135deg, #1a6b3c 0%, #2d8a56 100%)', 
        border: 'none', color: '#fff', padding: 24, position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 100, opacity: 0.1 }}>📊</div>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          💡 Key Survey Insights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
            <strong>Regional Awareness:</strong> {awareness.awareOfSoilTesting}% of farmers in Tumkur are aware of testing services.
          </div>
          <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
            <strong>Top Crop:</strong> {cropStats[0]?._id || 'Pending'} is the most common crop among surveyed farmers.
          </div>
        </div>
      </div>
    </div>
  )
}
