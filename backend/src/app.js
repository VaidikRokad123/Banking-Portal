const express = require("express")
const authRoutes = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Welcome to Bank API 🏦");
});

app.use("/api/auth", authRoutes)

module.exports = app