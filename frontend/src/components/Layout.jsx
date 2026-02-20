import { useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
    const navigate = useNavigate()

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                    🏦 SBI Online
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            <div className="page-body">
                {children}
            </div>


        </div>
    )
}
