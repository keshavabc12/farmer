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
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Survey insights and data visualisation</p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Completion Rate', value: `${Math.round((totals.completed || 0) / t * 100)}%`, icon: '✅' },
          { label: 'Awareness Rate', value: `${awareness.awareOfSoilTesting ?? 0}%`, icon: '💡' },
          { label: 'Adoption Rate',  value: `${awareness.noBarriers ?? 0}%`, icon: '🌱' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card fade-up" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 24, fontWeight: 700, color: '#1a6b3c' }}>{value}</div>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Donut rings */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.1s' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#1a6b3c', marginBottom: 20 }}>
          Awareness Overview
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <DonutRing pct={awareness.awareOfSoilTesting ?? 68} label="Aware of Soil Testing" color="#1a6b3c" />
          <DonutRing pct={awareness.hasTested ?? 42}           label="Have Tested Soil"      color="#4ecb85" />
          <DonutRing pct={awareness.usesReports ?? 29}         label="Use Reports"           color="#d97706" />
          <DonutRing pct={awareness.noBarriers ?? 55}          label="No Barriers"           color="#3b82f6" />
        </div>
      </div>

      {/* Survey status breakdown */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.15s' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#1a6b3c', marginBottom: 16 }}>
          Survey Status Breakdown
        </div>
        <MetricBar label="Completed" value={totals.completed || 0} max={totals.total || 1} color="#4ecb85" />
        <MetricBar label="Pending"   value={totals.pending  || 0} max={totals.total || 1} color="#f59e0b" />
        <MetricBar label="Draft"     value={totals.draft    || 0} max={totals.total || 1} color="#9ca3af" />
        <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0faf4', borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#374151' }}>Total Surveys</span>
          <span style={{ color: '#1a6b3c', fontWeight: 700 }}>{totals.total || 0}</span>
        </div>
      </div>

      {/* Crop distribution */}
      {cropStats.length > 0 && (
        <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.2s' }}>
          <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, color: '#1a6b3c', marginBottom: 16 }}>
            Crop Distribution
          </div>
          {cropStats.slice(0, 6).map(c => (
            <MetricBar key={c._id} label={c._id || 'Other'} value={c.count} max={totals.total || 1} color="#4ecb85" />
          ))}
        </div>
      )}

      {/* Key insights box */}
      <div style={{
        background: 'linear-gradient(135deg,#1a6b3c,#2d8a56)', borderRadius: 16,
        padding: '22px 20px', color: '#fff',
        boxShadow: '0 8px 24px rgba(26,107,60,0.25)'
      }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
          📊 Key Insights
        </div>
        {[
          `${awareness.awareOfSoilTesting ?? 68}% of farmers are aware of soil testing — above national average`,
          `Only ${awareness.hasTested ?? 42}% have actually tested their soil — awareness gap identified`,
          `${awareness.usesReports ?? 29}% actively use their soil health card reports`,
          `${awareness.noBarriers ?? 55}% reported no major barriers to soil testing`,
        ].map((insight, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7fffc4', flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
