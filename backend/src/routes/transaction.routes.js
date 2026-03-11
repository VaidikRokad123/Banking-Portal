const express = require("express")
const router = express.Router()

const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.get("/history", authMiddleware.authMiddleware, transactionController.getTransactionHistoryController)
router.get("/report", authMiddleware.authMiddleware, transactionController.getTransactionReportController)

router.post("/", authMiddleware.authMiddleware, (req, res) => {
    if (req.user.systemUser) {
        return transactionController.createSystemUserTransactionController(req, res)
    }
    return transactionController.createTransactionController(req, res)
})

router.get("/", authMiddleware.authMiddleware, transactionController.getTransactionsController)

module.exports = router

