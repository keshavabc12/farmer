import { useState, useEffect, useCallback } from 'react'
import { fetchFarmers, deleteFarmer } from '../api'
import { useToast } from '../context/ToastContext'
import { downloadCSV } from '../utils'

const STATUS_COLOR = { Complete: '#1a6b3c', Pending: '#d97706', Draft: '#6b7280' }
const STATUS_BG    = { Complete: '#dcfce7', Pending: '#fef3c7', Draft: '#f3f4f6' }
const CROPS        = ['All Crops','Paddy','Ragi','Maize','Coconut','Areca','Vegetables','Pulses','Others']
const TALUKS       = ['All Taluks','Tumkur Rural','Gubbi','Tiptur','Kunigal']

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
      toast('Record deleted successfully.', 'success')
      load()
    } catch { toast('Failed to delete record.', 'error') }
    finally { setDeleting(null) }
  }

  const handleExport = async () => {
    try {
      toast('Preparing export data...', 'info')
      const res = await fetchFarmers({ limit: 10000 }) // Fetch all for export
      const data = res.data.farmers.map(f => {
        const { photo, __v, ...rest } = f; // Exclude photo and version key
        return rest;
      })
      if (!data.length) return toast('No data to export', 'info')
      
      downloadCSV(data, `soilsense_responses_${new Date().toISOString().slice(0,10)}.csv`)
      toast('CSV Exported successfully! 📥', 'success')
    } catch (err) {
      console.error(err)
      toast('Export failed', 'error')
    }
  }

  const setFilter = (key, val) => { setFilters(p => ({ ...p, [key]: val })); setPage(1) }

  const pages = Math.ceil(total / 10)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 32, fontWeight: 800, color: '#1a6b3c' }}>Survey Responses</h1>
          <p style={{ fontSize: 13, color: '#8d6e63', marginTop: 4, fontWeight:500 }}>{total} farmers surveyed in Tumkur district</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="tap" onClick={handleExport} 
            style={{ background:'#f0faf4', color:'#1a6b3c', border:'1.5px solid #d1fae5', borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            📥 Export CSV
          </button>
          <button className="btn-primary" onClick={() => setActive('New Survey')} style={{ width: 'auto', padding: '10px 20px', fontSize:13 }}>
            ＋ Add New
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card fade-up" style={{ marginBottom: 20, background:'#fdfbf7', border:'1.5px solid #f5deb3' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ color:'#8d6e63' }}>Status</label>
            <select className="form-input" value={filters.status} onChange={e => setFilter('status', e.target.value)} style={{ background:'#fff' }}>
              <option value="">All Status</option>
              {['Complete','Pending','Draft'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#8d6e63' }}>Taluk</label>
            <select className="form-input" value={filters.taluk} onChange={e => setFilter('taluk', e.target.value)} style={{ background:'#fff' }}>
              {TALUKS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#8d6e63' }}>Main Crop</label>
            <select className="form-input" value={filters.cropType} onChange={e => setFilter('cropType', e.target.value)} style={{ background:'#fff' }}>
              {CROPS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color:'#8d6e63' }}>Village Search</label>
            <input className="form-input" placeholder="Search village..." value={filters.village} onChange={e => setFilter('village', e.target.value)} style={{ background:'#fff' }} />
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button className="tap" onClick={() => { setFilters({ status:'', cropType:'', village:'', taluk:'' }); setPage(1) }}
            style={{ background:'none', border:'none', color:'#d97706', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ✕ Reset All Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="card fade-up" style={{ padding: 0, overflow: 'hidden', border:'1.5px solid #d1fae5' }}>
        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
            <h3 style={{ fontFamily:"'Crimson Pro',serif", color: '#1a6b3c', marginBottom:8 }}>No records found</h3>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Try clearing filters or start a new survey.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f0faf4', borderBottom: '2px solid #d1fae5' }}>
                  <th style={{ textAlign:'left', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Farmer Name</th>
                  <th style={{ textAlign:'left', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Taluk</th>
                  <th style={{ textAlign:'left', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Village</th>
                  <th style={{ textAlign:'left', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Crop</th>
                  <th style={{ textAlign:'left', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Status</th>
                  <th style={{ textAlign:'center', padding:'16px 20px', fontSize:10, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', letterSpacing:1 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f, i) => (
                  <tr key={f._id} style={{ borderBottom: '1px solid #f0faf4', transition: 'background 0.15s' }}>
                    <td style={{ padding:'16px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:12, background:'#f0faf4', border:'1px solid #d1fae5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                          {f.q1_gender === 'Female' ? '👩‍🌾' : '👨‍🌾'}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{f.farmerName}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>ID: {f._id.slice(-6).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'16px 20px', fontSize: 14, color: '#374151', fontWeight:500 }}>{f.taluk}</td>
                    <td style={{ padding:'16px 20px', fontSize: 14, color: '#374151' }}>{f.village}</td>
                    <td style={{ padding:'16px 20px' }}>
                      <span style={{ fontSize: 12, padding:'4px 10px', background:'#fff', border:'1px solid #d1fae5', borderRadius:20, color:'#1a6b3c', fontWeight:600 }}>
                        {f.q5_mainCrop || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding:'16px 20px' }}>
                      <span className="badge" style={{ background: STATUS_BG[f.status], color: STATUS_COLOR[f.status], padding:'4px 12px', fontSize:10 }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ padding:'16px 20px', textAlign:'center' }}>
                      <button onClick={() => handleDelete(f._id)} disabled={deleting === f._id} className="tap"
                        style={{ background:'none', border:'none', fontSize:18, color:'#dc2626', opacity: deleting===f._id ? 0.3 : 0.7 }}>
                        {deleting===f._id ? '⏳' : '🗑️'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap:10, marginTop:24 }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', fontSize:13 }}>← Previous</button>
          <div style={{ fontSize:14, fontWeight:700, color:'#1a6b3c' }}>Page {page} of {pages}</div>
          <button className="btn-outline" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            style={{ padding: '8px 16px', fontSize:13 }}>Next →</button>
        </div>
      )}
    </div>
  )
}
