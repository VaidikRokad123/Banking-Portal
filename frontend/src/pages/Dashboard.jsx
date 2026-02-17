import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) {
            navigate('/login')
            return
        }
        setUser(JSON.parse(stored))
    }, [navigate])

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    if (!user) return null

    const joinDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-logo">🏦 SBI Online</div>
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <div className="welcome-avatar">👤</div>
                    <h2>Welcome, <span>{user.name}</span></h2>
                    <p>You are now logged in to your State Bank of India account.</p>

                    <div className="account-info">
                        <div className="info-tile">
                            <div className="tile-label">Account ID</div>
                            <div className="tile-value accent">{user._id?.slice(-8).toUpperCase()}</div>
                        </div>
                        <div className="info-tile">
                            <div className="tile-label">Email</div>
                            <div className="tile-value">{user.email}</div>
                        </div>
                        <div className="info-tile">
                            <div className="tile-label">Status</div>
                            <div className="tile-value success">● Active</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
