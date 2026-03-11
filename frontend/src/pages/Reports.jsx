import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTransactionReport } from '../api'

export default function Reports() {
    const navigate = useNavigate()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({ fromDate: '', toDate: '' })

    useEffect(() => {
        const stored = localStorage.getItem('user')
        if (!stored) { navigate('/login'); return }
        fetchReport()
    }, [navigate])

    async function fetchReport() {
        setLoading(true)
        try {
            const data = await getTransactionReport(filters)
            setReport(data)
        } catch (err) {
            console.error('Failed to fetch report:', err)
        } finally {
            setLoading(false)
        }
    }

    function handleFilterChange(e) {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function handleApply(e) {
        e.preventDefault()
        fetchReport()
    }

    function handleReset() {
        setFilters({ fromDate: '', toDate: '' })
        setTimeout(() => fetchReport(), 0)
    }

    function exportCSV() {
        if (!report) return
        const rows = [['Month', 'Credits', 'Debits', 'Net', 'Transactions']]
        report.monthlyBreakdown.forEach(m => {
            rows.push([m.label, m.credits, m.debits, m.net, m.count])
        })
        rows.push([])
        rows.push(['Summary'])
        rows.push(['Total Credits', report.summary.totalCredits])
        rows.push(['Total Debits', report.summary.totalDebits])
        rows.push(['Net Flow', report.summary.netFlow])
        rows.push(['Total Entries', report.summary.totalTransactions])

        const csv = rows.map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bank_report_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    function handlePrint() {
        window.print()
    }

    const currencySymbol = '₹'
    const statusColors = {
        SUCCESS: 'var(--success)',
        PENDING: '#facc15',
        FAILED: 'var(--danger)',
        REVERSED: '#a78bfa'
    }
    const statusIcons = {
        SUCCESS: '✅',
        PENDING: '⏳',
        FAILED: '❌',
        REVERSED: '↩️'
    }

    const maxBar = report?.monthlyBreakdown?.length > 0
        ? Math.max(...report.monthlyBreakdown.flatMap(m => [m.credits, m.debits]), 1)
        : 1

    const totalStatusCount = report?.byStatus
        ? Object.values(report.byStatus).reduce((a, b) => a + b, 0)
        : 0

    return (
        <div className="reports-page">
            <div className="reports-container">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>← Return to Dashboard</button>
                <div className="reports-header">
                    <div className="reports-header-icon">📊</div>
                    <h2>Financial Reports</h2>
                    <p>Analyze your transaction patterns and financial flow</p>
                </div>

                {/* Date Range Filter */}
                <form className="report-filter-bar" onSubmit={handleApply}>
                    <div className="filter-group">
                        <label>From Date</label>
                        <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-group">
                        <label>To Date</label>
                        <input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} />
                    </div>
                    <div className="filter-actions">
                        <button type="submit" className="btn btn-primary filter-btn">📊 Generate</button>
                        <button type="button" className="btn btn-secondary filter-btn" onClick={handleReset}>↩ Reset</button>
                    </div>
                </form>

                {loading ? (
                    <div className="history-loading">
                        <div className="spinner-lg"></div>
                        <p>Generating report...</p>
                    </div>
                ) : report ? (
                    <div className="report-body">
                        {/* Summary Cards */}
                        <div className="summary-cards">
                            <div className="summary-card card-credits">
                                <div className="summary-icon">📥</div>
                                <div className="summary-label">Total Credits</div>
                                <div className="summary-value credit-color">
                                    {currencySymbol}{Number(report.summary.totalCredits).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="summary-card card-debits">
                                <div className="summary-icon">📤</div>
                                <div className="summary-label">Total Debits</div>
                                <div className="summary-value debit-color">
                                    {currencySymbol}{Number(report.summary.totalDebits).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="summary-card card-net">
                                <div className="summary-icon">{report.summary.netFlow >= 0 ? '📈' : '📉'}</div>
                                <div className="summary-label">Net Flow</div>
                                <div className={`summary-value ${report.summary.netFlow >= 0 ? 'credit-color' : 'debit-color'}`}>
                                    {report.summary.netFlow >= 0 ? '+' : ''}{currencySymbol}{Number(report.summary.netFlow).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="summary-card card-count">
                                <div className="summary-icon">🔢</div>
                                <div className="summary-label">Total Entries</div>
                                <div className="summary-value">{report.summary.totalTransactions}</div>
                            </div>
                        </div>

                        {/* Monthly Breakdown Chart */}
                        <div className="report-section">
                            <h3 className="section-title">📅 Monthly Breakdown</h3>
                            {report.monthlyBreakdown.length > 0 ? (
                                <div className="chart-container">
                                    {report.monthlyBreakdown.map((m, i) => (
                                        <div className="chart-row" key={i}>
                                            <div className="chart-label">{m.label}</div>
                                            <div className="chart-bars">
                                                <div className="bar-group">
                                                    <div
                                                        className="bar bar-credit"
                                                        style={{ width: `${(m.credits / maxBar) * 100}%` }}
                                                        title={`Credits: ${currencySymbol}${m.credits.toLocaleString()}`}
                                                    >
                                                        {m.credits > 0 && <span>{currencySymbol}{m.credits.toLocaleString()}</span>}
                                                    </div>
                                                    <div
                                                        className="bar bar-debit"
                                                        style={{ width: `${(m.debits / maxBar) * 100}%` }}
                                                        title={`Debits: ${currencySymbol}${m.debits.toLocaleString()}`}
                                                    >
                                                        {m.debits > 0 && <span>{currencySymbol}{m.debits.toLocaleString()}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`chart-net ${m.net >= 0 ? 'credit-color' : 'debit-color'}`}>
                                                {m.net >= 0 ? '+' : ''}{currencySymbol}{m.net.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="chart-legend">
                                        <span className="legend-item"><span className="legend-dot credit-dot"></span> Credits</span>
                                        <span className="legend-item"><span className="legend-dot debit-dot"></span> Debits</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state-sm">No data available for selected period.</div>
                            )}
                        </div>

                        {/* Status Breakdown */}
                        <div className="report-section">
                            <h3 className="section-title">📋 Status Breakdown</h3>
                            {totalStatusCount > 0 ? (
                                <div className="status-breakdown">
                                    <div className="status-bar-container">
                                        {Object.entries(report.byStatus).map(([stat, count]) => (
                                            <div
                                                key={stat}
                                                className="status-segment"
                                                style={{
                                                    width: `${(count / totalStatusCount) * 100}%`,
                                                    backgroundColor: statusColors[stat] || '#64748b'
                                                }}
                                                title={`${stat}: ${count}`}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="status-legend">
                                        {Object.entries(report.byStatus).map(([stat, count]) => (
                                            <div className="status-legend-item" key={stat}>
                                                <span className="status-legend-dot" style={{ backgroundColor: statusColors[stat] || '#64748b' }}></span>
                                                <span className="status-legend-label">{statusIcons[stat]} {stat}</span>
                                                <span className="status-legend-count">{count} ({((count / totalStatusCount) * 100).toFixed(0)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state-sm">No transactions in the selected period.</div>
                            )}
                        </div>

                        {/* Export Actions */}
                        <div className="report-actions">
                            <button className="btn btn-primary" onClick={exportCSV}>📄 Export CSV</button>
                            <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print Report</button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>No Report Data</h3>
                        <p>Generate a report by clicking the button above.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
