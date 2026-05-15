import { useState, useEffect } from 'react'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewSurvey from './pages/NewSurvey'
import Responses from './pages/Responses'
import Analytics from './pages/Analytics'
import Settings  from './pages/Settings'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_user')) } catch { return null }
  })

  // Keep user in sync with localStorage
  useEffect(() => {
    if (user) localStorage.setItem('mm_user', JSON.stringify(user))
    else localStorage.removeItem('mm_user')
  }, [user])

  const handleLogin  = (u) => setUser(u)
  const handleLogout = () => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setUser(null)
    setActive('Dashboard')
  }

  // Not logged in → show Login page
  if (!user) return (
    <ToastProvider>
      <Login onLogin={handleLogin} />
    </ToastProvider>
  )

  const renderPage = () => {
    switch (active) {
      case 'Dashboard':  return <Dashboard setActive={setActive} />
      case 'New Survey': return <NewSurvey setActive={setActive} />
      case 'Responses':  return <Responses setActive={setActive} />
      case 'Analytics':  return <Analytics />
      case 'Settings':   return <Settings user={user} onLogout={handleLogout} />
      default:           return <Dashboard setActive={setActive} />
    }
  }

  return (
    <ToastProvider>
      <Layout active={active} setActive={setActive} user={user} onLogout={handleLogout}>
        {renderPage()}
      </Layout>
    </ToastProvider>
  )
}
