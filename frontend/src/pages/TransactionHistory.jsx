import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactionHistory, getAccounts } from '../api'

export default function TransactionHistory() {
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const limit = 10

    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        type: '',
        status: '',
        accountId: ''
    })

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) { navigate('/login'); return }
        fetchAccounts()
    }, [navigate])

    useEffect(() => {
        fetchHistory()
    }, [page])

    async function fetchAccounts() {
        try {
            const data = await getAccounts()
            setAccounts(data.accounts || [])
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        }
    }

    async function fetchHistory() {
        setLoading(true)
        try {
            const data = await getTransactionHistory({ ...filters, page, limit })
            setTransactions(data.transactions || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 0)
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setLoading(false)
        }
    }

    function handleFilterChange(e) {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleSearch(e) {
        e.preventDefault()
        setPage(1)
        fetchHistory()
    }

    function handleReset() {
        setFilters({ fromDate: '', toDate: '', type: '', status: '', accountId: '' })
        setPage(1)
        setTimeout(() => fetchHistory(), 0)
    }

    const accountIds = accounts.map(a => a._id)
    const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }

    return (
        <div className="history-page">
            <div className="history-container">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>← Return to Dashboard</button>
                <div className="history-header">
                    <div className="history-header-icon">📋</div>
                    <h2>Transaction History</h2>
                    <p>Search, filter, and browse all your transactions</p>
                </div>

                {/* Filter Bar */}
                <form className="filter-bar" onSubmit={handleSearch}>
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>From Date</label>
                            <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
                        </div>
                        <div className="filter-group">
                            <label>To Date</label>
                            <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
                        </div>
                        <div className="filter-group">
                            <label>Type</label>
                            <select name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">All</option>
                                <option value="CREDIT">Credit (Received)</option>
                                <option value="DEBIT">Debit (Sent)</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">All</option>
                                <option value="SUCCESS">Success</option>
                                <option value="PENDING">Pending</option>
                                <option value="FAILED">Failed</option>
                                <option value="REVERSED">Reversed</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Account</label>
                            <select name="accountId" value={filters.accountId} onChange={handleFilterChange}>
                                <option value="">All Accounts</option>
                                {accounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>
                                        {acc._id.slice(-8).toUpperCase()} ({acc.currency})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="btn btn-primary filter-btn">🔍 Search</button>
                        <button type="button" className="btn btn-secondary filter-btn" onClick={handleReset}>↩ Reset</button>
                    </div>
                </form>

                {/* Results info */}
                <div className="results-info">
                    <span>{total} transaction{total !== 1 ? 's' : ''} found</span>
                    {totalPages > 1 && <span>Page {page} of {totalPages}</span>}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="history-loading">
                        <div className="spinner-lg"></div>
                        <p>Loading transactions...</p>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => {
                                    const fromIsUser = accountIds.includes(tx.fromAcoount?._id)
                                    const toIsUser = accountIds.includes(tx.toAcoount?._id)
                                    const isInternal = fromIsUser && toIsUser
                                    const isDebit = fromIsUser && !isInternal
                                    const txCurrency = tx.fromAcoount?.currency || tx.toAcoount?.currency || 'INR'

                                    return (
                                        <tr key={tx._id} className="table-row-animate">
                                            <td className="td-date">
                                                <div>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                <div className="td-time">{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td>
                                                {isInternal ? (
                                                    <span className="type-badge type-self">🔄 Self Transfer</span>
                                                ) : (
                                                    <span className={`type-badge ${isDebit ? 'type-debit' : 'type-credit'}`}>
                                                        {isDebit ? '📤 Debit' : '📥 Credit'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="td-account">{tx.fromAcoount?._id?.slice(-8).toUpperCase() || '—'}</td>
                                            <td className="td-account">{tx.toAcoount?._id?.slice(-8).toUpperCase() || '—'}</td>
                                            <td className={`td-amount ${isInternal ? 'amount-self' : isDebit ? 'amount-debit' : 'amount-credit'}`}>
                                                {isInternal ? '' : isDebit ? '-' : '+'}{currencySymbol[txCurrency]}{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No Transactions Found</h3>
                        <p>Try adjusting your filters or date range.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            ← Previous
                        </button>
                        <div className="page-numbers">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let pageNum
                                if (totalPages <= 7) {
                                    pageNum = i + 1
                                } else if (page <= 4) {
                                    pageNum = i + 1
                                } else if (page >= totalPages - 3) {
                                    pageNum = totalPages - 6 + i
                                } else {
                                    pageNum = page - 3 + i
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        className={`page-num ${pageNum === page ? 'active' : ''}`}
                                        onClick={() => setPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>
                        <button
                            className="page-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
