const express = require("express")
const router = express.Router()

const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/", authMiddleware.authMiddleware, (req, res) => {
    if (req.user.systemUser) {
        return transactionController.createSystemUserTransactionController(req, res)
    }
    return transactionController.createTransactionController(req, res)
})

module.exports = router
