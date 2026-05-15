import { useState } from 'react'
import { loginUser } from '../api'
import { useToast } from '../context/ToastContext'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast('Please enter email and password.', 'error')
    
    setLoading(true)
    try {
      const res = await loginUser({ email, password })
      
      localStorage.setItem('mm_token', res.data.token)
      localStorage.setItem('mm_user',  JSON.stringify(res.data.user))
      
      toast('Login Successful! Welcome back. 🌿', 'success')
      onLogin(res.data.user)
    } catch (err) {
      toast(err.response?.data?.error || 'Invalid email or password.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0d3d21 0%,#1a6b3c 40%,#2d8a56 70%,#3aad6e 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'DM Sans',sans-serif", padding:20,
      position:'relative', overflow:'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position:'absolute',top:-100,right:-100,width:320,height:320,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }} />
      <div style={{ position:'absolute',bottom:-120,left:-80,width:380,height:380,borderRadius:'50%',background:'rgba(255,255,255,0.03)' }} />
      
      <div className="fade-up" style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:72, height:72, background:'rgba(255,255,255,0.15)', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:34, margin:'0 auto 16px',
            border:'2px solid rgba(255,255,255,0.3)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <span className="leaf">🌿</span>
          </div>
          <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:34, fontWeight:700, color:'#fff', marginBottom:6, lineHeight:1 }}>
            Mitti Mitra
          </h1>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.55)', letterSpacing:1.8, textTransform:'uppercase' }}>
            Soil Research Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,0.97)', borderRadius:24, padding:'36px 32px',
          boxShadow:'0 28px 70px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontWeight:700, color:'#1a6b3c', marginBottom:6, textAlign:'center' }}>
            Sign In
          </h2>
          <p style={{ fontSize:12, color:'#9ca3af', textAlign:'center', marginBottom:28 }}>
            Enter your credentials to access the platform
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>📧</span>
                <input className="form-input" type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft:38 }} autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom:28 }}>
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔒</span>
                <input className="form-input" type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft:38, paddingRight:44 }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', fontSize:17, color:'#9ca3af', lineHeight:1, padding:0
                  }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ fontSize:14, padding:'14px', letterSpacing:0.4, borderRadius:12 }}>
              {loading ? '⏳ Verifying…' : '🔑 Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:22, fontSize:11, color:'rgba(255,255,255,0.4)' }}>
          Powered by Mitti Mitra Backend · MongoDB Atlas
        </p>
      </div>
    </div>
  )
}
