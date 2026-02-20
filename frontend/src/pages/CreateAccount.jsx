import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAccount } from '../api'

export default function CreateAccount() {
    const [currency, setCurrency] = useState('INR')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const data = await createAccount(currency)
            setSuccess('Account created successfully!')
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-content">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">🏦</div>
                    <h1>Open New Account</h1>
                    <p>Select your preferred currency</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currency">Currency</label>
                        <select
                            id="currency"
                            className="form-select"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="INR">🇮🇳 INR — Indian Rupee</option>
                            <option value="USD">🇺🇸 USD — US Dollar</option>
                            <option value="EUR">🇪🇺 EUR — Euro</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Create Account'}
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
