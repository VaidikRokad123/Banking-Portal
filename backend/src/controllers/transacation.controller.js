const transactionModel = require("../models/transacation.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")


async function createTransactionController(req, res) {
    try {
        const { fromAcoount, toAcoount, amount, idempotencyKey } = req.body

        if (!fromAcoount || !toAcoount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "All fields are required",
                status: false
            })
        }

        const fromUserAccount = await accountModel.findById(fromAcoount)
        const toUserAccount = await accountModel.findById(toAcoount)

        if (!fromUserAccount || !toUserAccount) {
            return res.status(404).json({
                message: "Account not found",
                status: false
            })
        }

        const isTransactionAlreadyExist = await transactionModel.findOne({ idempotencyKey })
        if (isTransactionAlreadyExist) {
            if (isTransactionAlreadyExist.status == "COMPLETED") {
                return res.status(200).json({
                    message: "Transaction already exists",
                    status: true
                })
            }
            if (isTransactionAlreadyExist.status == "PENDING") {
                return res.status(200).json({
                    message: "Transaction is pending",
                    status: true
                })
            }
            if (isTransactionAlreadyExist.status == "FAILED") {
                return res.status(500).json({
                    message: "Transaction Processing Failed",
                    status: false
                })
            }
            if (isTransactionAlreadyExist.status == "REVERSED") {
                return res.status(500).json({
                    message: "Transaction Was Reversed, Please Try Again Later",
                    status: false
                })
            }
        }

        if (fromUserAccount.status != "ACTIVE" || toUserAccount.status != "ACTIVE") {
            return res.status(400).json({
                message: "Account is not active",
                status: false
            })
        }

        const fromAccountBalance = await fromUserAccount.getBalance()

        if (fromAccountBalance < amount) {
            return res.status(400).json({
                message: "Insufficient balance",
                status: false
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = await transactionModel.create({
            fromAcoount,
            toAcoount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }, { session })


        const debitLedgerEntry = await ledgerModel.create({
            account: fromAcoount,
            type: "DEBIT",
            amount,
            transaction: transaction._id,
            description: "Debit entry for transaction"
        }, { session })

        const creditLedgerEntry = await ledgerModel.create({
            account: toAcoount,
            type: "CREDIT",
            amount,
            transaction: transaction._id,
            description: "Credit entry for transaction"
        }, { session })

        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            message: "Transaction created successfully",
            status: true
        })

        emailService.sendTransactionEmail(fromUserAccount.email, fromUserAccount.name, amount, "debit")
        emailService.sendTransactionEmail(toUserAccount.email, toUserAccount.name, amount, "credit")









    }
    catch (error) {
        console.error("Error creating transaction:", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }

}

module.exports = {
    createTransactionController
}