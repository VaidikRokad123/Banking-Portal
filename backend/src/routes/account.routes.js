const express = require("express")
const router = express.Router()



const accountController = require("../controllers/account.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)
router.get("/", authMiddleware.authMiddleware, accountController.getAccountsController)



module.exports = router