const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")

const app = express()

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Welcome to Bank API 🏦");
});

app.use("/api/auth", authRoutes)

module.exports = app