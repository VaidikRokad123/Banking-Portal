const express = require("express")
const router = express.Router()

const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/", authMiddleware.authMiddleware, transactionController.createTransactionController)
router.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createSystemUserTransactionController)

module.exports = router
