const express = require("express")
const router = express.Router()

const transactionController = require("../controllers/transacation.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/", authMiddleware.authMiddleware, transactionController.createTransactionController)

module.exports = router