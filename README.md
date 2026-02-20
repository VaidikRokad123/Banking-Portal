# 🏦 Banking Portal

A full-stack banking application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It simulates core banking operations like user registration, account management, fund transfers, and transaction tracking — complete with email notifications and a modern dark-themed UI.

---

## ✨ Features

- **User Authentication** — Secure registration & login with JWT and bcrypt
- **Account Management** — Create bank accounts with multi-currency support (INR, USD, EUR)
- **Fund Transfers** — Transfer money between accounts with real-time balance updates
- **Transaction History** — Track all deposits, withdrawals, and transfers
- **Double-Entry Ledger** — Accurate bookkeeping using debit/credit ledger entries
- **Email Notifications** — Automated alerts for registration, login, and transactions via Nodemailer (OAuth2)
- **Dark Theme UI** — Sleek, modern glassmorphism design with smooth animations

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 19, Vite, React Router v7                 |
| Backend    | Node.js, Express 5                               |
| Database   | MongoDB (Mongoose ODM)                           |
| Auth       | JSON Web Tokens (JWT), bcryptjs                  |
| Email      | Nodemailer with Gmail OAuth2                     |
| Styling    | Vanilla CSS (Dark theme, Glassmorphism)          |

---

## 📁 Project Structure

```
Bank/
├── backend/
│   ├── server.js                  # Entry point
│   └── src/
│       ├── app.js                 # Express app setup
│       ├── config/                # Database configuration
│       ├── controllers/           # Route handlers
│       │   ├── auth.controller.js
│       │   ├── account.controller.js
│       │   └── transacation.controller.js
│       ├── middleware/            # Auth middleware (JWT)
│       ├── models/               # Mongoose schemas
│       │   ├── user.model.js
│       │   ├── account.model.js
│       │   ├── ledger.model.js
│       │   └── transacation.model.js
│       ├── routes/               # API routes
│       │   ├── auth.routes.js
│       │   ├── account.routes.js
│       │   └── transacation.routes.js
│       └── services/
│           └── email.service.js   # Email notification service
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Root component & routing
        ├── api.js                # API service layer
        ├── index.css             # Global styles (dark theme)
        ├── components/           # Reusable UI components
        └── pages/
            ├── Register.jsx
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── CreateAccount.jsx
            └── TransferMoney.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- Gmail account with OAuth2 credentials (for email notifications)

### 1. Clone the repository

```bash
git clone https://github.com/VaidikRokad123/Bank.git
cd Bank
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Email (Gmail OAuth2)
EMAIL_USER=your_email@gmail.com
EMAIL_CLIENT_ID=your_client_id
EMAIL_CLIENT_SECRET=your_client_secret
EMAIL_REFRESH_TOKEN=your_refresh_token
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be running at **http://localhost:5173**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |

### Accounts
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/api/account/create` | Create a new account     |
| GET    | `/api/account/`       | Get user's accounts      |

### Transactions
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | `/api/account/transfer`      | Transfer funds       |
| GET    | `/api/account/transactions`  | Get transaction history |

---

## 📸 Screenshots

> _Coming soon_

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Vaidik Rokad** — [@VaidikRokad123](https://github.com/VaidikRokad123)
