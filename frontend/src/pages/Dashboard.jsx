import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAccounts } from '../api'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [accounts, setAccounts] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) {
            navigate('/login')
            return
        }
        setUser(JSON.parse(stored))
        fetchAccounts()
    }, [navigate])

    async function fetchAccounts() {
        try {
            const data = await getAccounts()
            setAccounts(data.accounts || [])
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        }
    }

    if (!user) return null

    const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }

    return (
        <div className="dashboard-content">
            <div className="welcome-card">
                <div className="welcome-avatar">👤</div>
                <h2>Welcome, <span>{user.name}</span></h2>
                <p>You are now logged in to your State Bank of India account.</p>

                <div className="account-info">
                    <div className="info-tile">
                        <div className="tile-label">User ID</div>
                        <div className="tile-value accent">{user._id?.slice(-8).toUpperCase()}</div>
                    </div>
                    <div className="info-tile">
                        <div className="tile-label">Email</div>
                        <div className="tile-value">{user.email}</div>
                    </div>
                    <div className="info-tile">
                        <div className="tile-label">Accounts</div>
                        <div className="tile-value accent">{accounts.length}</div>
                    </div>
                </div>

                {accounts.length > 0 && (
                    <div className="accounts-list">
                        <h3 className="accounts-title">Your Accounts</h3>
                        {accounts.map((acc) => (
                            <div className="account-card" key={acc._id}>
                                <div className="account-card-row">
                                    <div className="account-card-item">
                                        <span className="tile-label">Account No.</span>
                                        <span className="tile-value accent">{acc._id?.slice(-10).toUpperCase()}</span>
                                    </div>
                                    <div className="account-card-item">
                                        <span className="tile-label">Currency</span>
                                        <span className="tile-value">{currencySymbol[acc.currency] || ''} {acc.currency}</span>
                                    </div>
                                    <div className="account-card-item">
                                        <span className="tile-label">Status</span>
                                        <span className={`tile-value ${acc.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                                            ● {acc.status}
                                        </span>
                                    </div>
                                    <div className="account-card-item">
                                        <span className="tile-label">Opened</span>
                                        <span className="tile-value">
                                            {new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="dashboard-actions">
                    <Link to="/create-account" className="btn btn-primary">
                        + Open New Account
                    </Link>
                    {accounts.length > 0 && (
                        <Link to="/transfer" className="btn btn-secondary">
                            💸 Transfer Money
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
