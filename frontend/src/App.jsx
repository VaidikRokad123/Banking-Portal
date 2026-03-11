import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateAccount from './pages/CreateAccount'
import TransferMoney from './pages/TransferMoney'
import TransactionHistory from './pages/TransactionHistory'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/create-account" element={<Layout><CreateAccount /></Layout>} />
                    <Route path="/transfer" element={<Layout><TransferMoney /></Layout>} />
                    <Route path="/history" element={<Layout><TransactionHistory /></Layout>} />
                    <Route path="/reports" element={<Layout><Reports /></Layout>} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App

