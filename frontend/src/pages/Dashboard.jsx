import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAccounts, getBalance, getTransactions, createInitialFunds } from '../api'

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [accounts, setAccounts] = useState([])
    const [balances, setBalances] = useState({})
    const [loadingBalance, setLoadingBalance] = useState({})
    const [transactions, setTransactions] = useState([])
    const [loadingTransactions, setLoadingTransactions] = useState(false)
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
        fetchTransactions()
    }, [navigate])

    async function fetchAccounts() {
        try {
            const data = await getAccounts()
            setAccounts(data.accounts || [])
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        }
    }

    async function fetchTransactions() {
        setLoadingTransactions(true)
        try {
            const data = await getTransactions()
            setTransactions(data.transactions || [])
        } catch (err) {
            console.error('Failed to fetch transactions:', err)
        } finally {
            setLoadingTransactions(false)
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
            fetchTransactions()
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
        <div className="dashboard-content">
            <div className="welcome-card">
                <div className="welcome-avatar">👤</div>
                <h2>Welcome, <span>{user.name}</span> {user.systemUser && <span className="system-badge">System Admin</span>}</h2>
                <p>You are now logged in to your State Bank of SBI account.</p>

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
                                        <span className="tile-value accent account-id">{acc._id}</span>
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
                                <div className="account-card-footer">
                                    <button
                                        className="btn-balance"
                                        onClick={() => handleCheckBalance(acc._id)}
                                        disabled={loadingBalance[acc._id]}
                                    >
                                        {loadingBalance[acc._id] ? (
                                            <><span className="spinner-sm"></span> Checking...</>
                                        ) : (
                                            <>💰 Check Balance</>
                                        )}
                                    </button>
                                    {balances[acc._id] !== undefined && (
                                        <div className="balance-display">
                                            <span className="balance-label">Balance</span>
                                            <span className="balance-value">
                                                {balances[acc._id] === 'Error'
                                                    ? '⚠️ Failed to load'
                                                    : `${currencySymbol[acc.currency] || ''}${Number(balances[acc._id]).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {user.systemUser && (
                                        <button
                                            className="btn-funds"
                                            onClick={() => setFundingAccount(acc._id)}
                                        >
                                            ➕ Add Funds
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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

                <div className="transactions-section">
                    <h3>Recent Transactions</h3>
                    {loadingTransactions ? (
                        <p>Loading transactions...</p>
                    ) : transactions.length > 0 ? (
                        <div className="transactions-list">
                            {transactions.map(tx => {
                                const isDebit = tx.fromAcoount?._id === accounts.find(a => a._id === tx.fromAcoount?._id)?._id;
                                return (
                                    <div className="transaction-item" key={tx._id}>
                                        <div className="tx-info">
                                            <span className="tx-type">{isDebit ? '📤 Sent to' : '📥 Received from'}</span>
                                            <span className="tx-account">
                                                {isDebit ? tx.toAcoount?._id : tx.fromAcoount?._id}
                                            </span>
                                            <span className="tx-date">{new Date(tx.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className={`tx-amount ${isDebit ? 'debit' : 'credit'}`}>
                                            {isDebit ? '-' : '+'}{currencySymbol[tx.fromAcoount?.currency || 'INR']} {tx.amount.toLocaleString()}
                                        </div>
                                        <div className={`tx-status ${tx.status.toLowerCase()}`}>{tx.status}</div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="no-tx">No transactions found.</p>
                    )}
                </div>

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
