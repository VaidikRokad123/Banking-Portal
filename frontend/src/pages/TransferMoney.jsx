import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAccounts, createTransaction } from '../api'

export default function TransferMoney() {
    const [accounts, setAccounts] = useState([])
    const [fromAccount, setFromAccount] = useState('')
    const [toAccount, setToAccount] = useState('')
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }
        fetchAccounts()
    }, [navigate])

    async function fetchAccounts() {
        try {
            const data = await getAccounts()
            setAccounts(data.accounts || [])
            if (data.accounts?.length > 0) {
                setFromAccount(data.accounts[0]._id)
            }
        } catch (err) {
            setError('Failed to load accounts')
        }
    }

    const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!fromAccount || !toAccount || !amount) {
            setError('All fields are required')
            return
        }

        if (fromAccount === toAccount) {
            setError('Cannot transfer to the same account')
            return
        }

        if (Number(amount) <= 0) {
            setError('Amount must be greater than 0')
            return
        }

        setLoading(true)

        try {
            const data = await createTransaction(fromAccount, toAccount, amount)
            setSuccess(data.message || 'Transaction completed successfully!')
            setAmount('')
            setToAccount('')
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-content">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-logo">
                    <div className="logo-icon">💸</div>
                    <h1>Transfer Money</h1>
                    <p>Send money to another account</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fromAccount">From Account</label>
                        <select
                            id="fromAccount"
                            className="form-select"
                            value={fromAccount}
                            onChange={(e) => setFromAccount(e.target.value)}
                        >
                            {accounts.map((acc) => (
                                <option key={acc._id} value={acc._id}>
                                    {currencySymbol[acc.currency]} {acc.currency} — ...{acc._id?.slice(-8).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="toAccount">To Account ID</label>
                        <input
                            id="toAccount"
                            type="text"
                            placeholder="Paste recipient's Account ID"
                            value={toAccount}
                            onChange={(e) => setToAccount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount</label>
                        <input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Send Money'}
                    </button>
                </form>

                <div className="auth-switch">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard') }}>
                        ← Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
