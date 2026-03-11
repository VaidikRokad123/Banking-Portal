import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAccounts, getBalance, createInitialFunds } from '../api'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [accounts, setAccounts] = useState([])
    const [balances, setBalances] = useState({})
    const [loadingBalance, setLoadingBalance] = useState({})
    const [fundingAccount, setFundingAccount] = useState(null)
    const [fundAmount, setFundAmount] = useState('1000')
    const [fundingLoading, setFundingLoading] = useState(false)
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

    async function handleAddInitialFunds() {
        if (!fundingAccount) return
        setFundingLoading(true)
        try {
            await createInitialFunds(fundingAccount, fundAmount)
            alert('Initial funds added successfully!')
            setFundingAccount(null)
            fetchAccounts()
        } catch (err) {
            alert(err.message)
        } finally {
            setFundingLoading(false)
        }
    }

    async function handleCheckBalance(accountId) {
        setLoadingBalance(prev => ({ ...prev, [accountId]: true }))
        try {
            const data = await getBalance(accountId)
            setBalances(prev => ({ ...prev, [accountId]: data.balance }))
        } catch (err) {
            console.error('Failed to fetch balance:', err)
            setBalances(prev => ({ ...prev, [accountId]: 'Error' }))
        } finally {
            setLoadingBalance(prev => ({ ...prev, [accountId]: false }))
        }
    }

    if (!user) return null

    const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }

    return (
        <div className="dash-page">
            {/* Greeting Banner */}
            <div className="dash-banner">
                <div className="dash-banner-left">
                    <div className="dash-greeting">
                        <h1>Welcome back, <span className="dash-name">{user.name}</span></h1>
                        {user.systemUser && <span className="system-badge">System Admin</span>}
                    </div>
                    <p className="dash-subtitle">State Bank of India — Internet Banking</p>
                </div>
                <div className="dash-profile">
                    <div className="dash-profile-info">
                        <div className="dash-profile-detail">
                            <span className="dash-meta-label">Customer ID</span>
                            <span className="dash-meta-value">{user._id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="dash-profile-detail">
                            <span className="dash-meta-label">Email</span>
                            <span className="dash-meta-value">{user.email}</span>
                        </div>
                        <div className="dash-profile-detail">
                            <span className="dash-meta-label">Last Login</span>
                            <span className="dash-meta-value">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-quick-actions">
                <Link to="/create-account" className="quick-action-card">
                    <div className="qa-icon">🏦</div>
                    <div className="qa-text">
                        <span className="qa-title">Open Account</span>
                        <span className="qa-desc">New savings or current account</span>
                    </div>
                </Link>
                {accounts.length > 0 && (
                    <Link to="/transfer" className="quick-action-card">
                        <div className="qa-icon">💸</div>
                        <div className="qa-text">
                            <span className="qa-title">Fund Transfer</span>
                            <span className="qa-desc">Send money to any account</span>
                        </div>
                    </Link>
                )}
                <Link to="/history" className="quick-action-card">
                    <div className="qa-icon">📋</div>
                    <div className="qa-text">
                        <span className="qa-title">View Statement</span>
                        <span className="qa-desc">Transaction history & search</span>
                    </div>
                </Link>
                <Link to="/reports" className="quick-action-card">
                    <div className="qa-icon">📊</div>
                    <div className="qa-text">
                        <span className="qa-title">Reports</span>
                        <span className="qa-desc">Analytics & export data</span>
                    </div>
                </Link>
            </div>

            {/* Account Summary */}
            <div className="dash-section">
                <div className="dash-section-header">
                    <h2>Account Summary</h2>
                    <span className="dash-section-count">{accounts.length} Account{accounts.length !== 1 ? 's' : ''}</span>
                </div>

                {accounts.length > 0 ? (
                    <div className="dash-accounts-grid">
                        {accounts.map((acc) => (
                            <div className="dash-account-card" key={acc._id}>
                                <div className="dac-header">
                                    <div className="dac-type">
                                        <span className="dac-type-label">Savings Account</span>
                                        <span className={`dac-status ${acc.status === 'ACTIVE' ? 'dac-active' : 'dac-inactive'}`}>
                                            {acc.status}
                                        </span>
                                    </div>
                                    <span className="dac-currency">{currencySymbol[acc.currency] || ''} {acc.currency}</span>
                                </div>
                                <div className="dac-number">
                                    <span className="dac-number-label">Account Number</span>
                                    <span className="dac-number-value">{acc._id}</span>
                                </div>
                                <div className="dac-balance-row">
                                    {balances[acc._id] !== undefined ? (
                                        <div className="dac-balance">
                                            <span className="dac-balance-label">Available Balance</span>
                                            <span className="dac-balance-amount">
                                                {balances[acc._id] === 'Error'
                                                    ? 'Failed to load'
                                                    : `${currencySymbol[acc.currency] || ''}${Number(balances[acc._id]).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                }
                                            </span>
                                        </div>
                                    ) : (
                                        <button
                                            className="dac-check-btn"
                                            onClick={() => handleCheckBalance(acc._id)}
                                            disabled={loadingBalance[acc._id]}
                                        >
                                            {loadingBalance[acc._id] ? (
                                                <><span className="spinner-sm"></span> Checking...</>
                                            ) : (
                                                'View Balance'
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="dac-footer">
                                    <span className="dac-opened">Opened {new Date(acc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    {user.systemUser && (
                                        <button
                                            className="dac-fund-btn"
                                            onClick={() => setFundingAccount(acc._id)}
                                        >
                                            + Add Funds
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="dash-no-accounts">
                        <p>You don't have any accounts yet.</p>
                        <Link to="/create-account" className="btn btn-primary">Open Your First Account</Link>
                    </div>
                )}
            </div>

            {/* Funding Modal */}
            {fundingAccount && (
                <div className="funding-modal-overlay">
                    <div className="funding-modal">
                        <h3>Add Initial Funds</h3>
                        <p>Target Account: {fundingAccount}</p>
                        <input
                            type="number"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            placeholder="Amount"
                        />
                        <div className="modal-actions">
                            <button onClick={() => setFundingAccount(null)} className="btn-cancel">Cancel</button>
                            <button onClick={handleAddInitialFunds} disabled={fundingLoading} className="btn-confirm">
                                {fundingLoading ? 'Adding...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
