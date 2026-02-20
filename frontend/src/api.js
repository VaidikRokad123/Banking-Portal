const API_URL = "http://localhost:3000";

export async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
}

export async function registerUser(name, email, password) {
    return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
}

export async function loginUser(email, password) {
    return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function createAccount(currency) {
    const token = localStorage.getItem('token');
    return apiRequest("/api/account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ currency }),
    });
}

export async function getAccounts() {
    const token = localStorage.getItem('token');
    return apiRequest("/api/account", {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
}

export async function createTransaction(fromAcoount, toAcoount, amount) {
    const token = localStorage.getItem('token');
    const idempotencyKey = crypto.randomUUID();
    return apiRequest("/api/transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ fromAcoount, toAcoount, amount: Number(amount), idempotencyKey }),
    });
}
