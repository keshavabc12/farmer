import { useState, useEffect, useCallback } from 'react'
import { fetchFarmers, deleteFarmer } from '../api'
import { useToast } from '../context/ToastContext'

const STATUS_COLOR = { Complete: '#1a6b3c', Pending: '#d97706', Draft: '#6b7280' }
const STATUS_BG    = { Complete: '#dcfce7', Pending: '#fef3c7', Draft: '#f3f4f6' }
const CROPS        = ['All Crops','Paddy','Ragi','Maize','Coconut','Areca','Vegetables','Pulses','Others']
const TALUKS       = ['All Taluks','Tumkur Rural','Gubbi']

export default function Responses({ setActive }) {
  const [farmers, setFarmers]   = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [filters, setFilters]   = useState({ status: '', cropType: '', village: '', taluk: '' })
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filters.status)   params.status   = filters.status
      if (filters.cropType && filters.cropType !== 'All Crops') params.cropType = filters.cropType
      if (filters.village)  params.village  = filters.village
      if (filters.taluk && filters.taluk !== 'All Taluks') params.taluk = filters.taluk
      
      const r = await fetchFarmers(params)
      setFarmers(r.data.farmers)
      setTotal(r.data.total)
    } catch { toast('Failed to load responses.', 'error') }
    finally { setLoading(false) }
  }, [page, filters, toast])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this farmer record? This cannot be undone.')) return
    setDeleting(id)
    try {
      await deleteFarmer(id)
      toast('Record deleted.', 'success')
      load()
    } catch { toast('Failed to delete.', 'error') }
    finally { setDeleting(null) }
  }

  const setFilter = (key, val) => { setFilters(p => ({ ...p, [key]: val })); setPage(1) }

  const pages = Math.ceil(total / 10)

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 30, fontWeight: 700, color: '#1a6b3c' }}>Responses</h1>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{total} total records</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-outline" onClick={async () => {
            try {
              const res = await fetchFarmers({ limit: 1000 }) // Fetch up to 1000 for export
              const data = res.data.farmers
              if (!data.length) return toast('No data to export', 'info')
              
              const headers = Object.keys(data[0]).filter(k => k !== 'photo' && k !== '__v')
              const csv = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
              ].join('\n')
              
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.setAttribute('hidden', '')
              a.setAttribute('href', url)
              a.setAttribute('download', `farmers_data_${new Date().toISOString().slice(0,10)}.csv`)
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              toast('CSV Downloaded! 📥', 'success')
            } catch { toast('Export failed', 'error') }
          }} style={{ width: 'auto', padding: '10px 18px' }}>
            📥 Export CSV
          </button>
          <button className="btn-primary" onClick={() => setActive('New Survey')} style={{ width: 'auto', padding: '10px 18px' }}>
            ＋ New Survey
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card fade-up" style={{ marginBottom: 16, animationDelay: '0.07s' }}>
        <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 18, fontWeight: 700, color: '#1a6b3c', marginBottom: 14 }}>
          Filter Responses
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              <option value="">All Status</option>
              {['Complete','Pending','Draft'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Taluk</label>
            <select className="form-select" value={filters.taluk} onChange={e => setFilter('taluk', e.target.value)}>
              {TALUKS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Crop Type</label>
            <select className="form-select" value={filters.cropType} onChange={e => setFilter('cropType', e.target.value)}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Village (Search)</label>
            <input className="form-input" placeholder="Enter village name..." value={filters.village} onChange={e => setFilter('village', e.target.value)} />
          </div>
        </div>
        <button className="btn-outline" onClick={() => { setFilters({ status:'', cropType:'', village:'', taluk:'' }); setPage(1) }}>
          ✕ Clear Filters
        </button>
      </div>

      {/* Table / Cards */}
      <div className="card fade-up" style={{ animationDelay: '0.13s', padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: '#374151' }}>No responses found</div>
            <div style={{ fontSize: 12 }}>Try adjusting the filters or submit a new survey.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
              gap: 12, padding: '12px 20px', minWidth: 650,
              background: '#f0faf4', borderBottom: '1.5px solid #d1fae5',
              fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase'
            }}>
              <span>Farmer</span><span>Taluk</span><span>Crop</span><span>Village</span><span>Status</span><span>Actions</span>
            </div>

            {farmers.map((f, i) => (
              <div key={f._id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                gap: 12, padding: '14px 20px', alignItems: 'center', minWidth: 650,
                borderBottom: i < farmers.length - 1 ? '1px solid #f0faf4' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fff9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: '#f0faf4',
                    border: '1.5px solid #d1fae5', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 14, flexShrink: 0
                  }}>👨‍🌾</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.farmerName}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>ID: {f._id.slice(-6).toUpperCase()}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#374151' }}>{f.taluk}</span>
                <span style={{ fontSize: 12, color: '#374151' }}>{f.mainCrop}</span>
                <span style={{ fontSize: 12, color: '#374151' }}>{f.village}</span>
                <span className="badge" style={{ background: STATUS_BG[f.status], color: STATUS_COLOR[f.status] }}>
                  {f.status}
                </span>
                <button
                  onClick={() => handleDelete(f._id)}
                  disabled={deleting === f._id}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, opacity: deleting === f._id ? 0.4 : 0.6,
                    transition: 'opacity 0.15s'
                  }}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 14px' }}>← Prev</button>
          {[...Array(Math.min(pages, 5))].map((_, i) => {
            const pg = i + 1
            return (
              <button key={pg} onClick={() => setPage(pg)}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: '1.5px solid',
                  borderColor: pg === page ? '#1a6b3c' : '#d1fae5',
                  background: pg === page ? '#1a6b3c' : '#fff',
                  color: pg === page ? '#fff' : '#374151',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600
                }}>
                {pg}
              </button>
            )
          })}
          <button className="btn-outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '7px 14px' }}>Next →</button>
        </div>
      )}
    </div>
  )
}
