const mongoose = require("mongoose")
const transactionModel = require("../models/transaction.model")
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

        const transaction = new transactionModel({
            fromAcoount,
            toAcoount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAcoount,
            type: "DEBIT",
            amount,
            transaction: transaction._id,
            description: "Debit entry for transaction"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAcoount,
            type: "CREDIT",
            amount,
            transaction: transaction._id,
            description: "Credit entry for transaction"
        }], { session })

        transaction.status = "SUCCESS"
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

async function createSystemUserTransactionController(req, res) {
    try {
        const { toAcoount, amount, idempotencyKey } = req.body

        if (!toAcoount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "All fields are required",
                status: false
            })
        }

        const toUserAccount = await accountModel.findById(toAcoount)

        if (!toUserAccount) {
            return res.status(404).json({
                message: "Account not found",
                status: false
            })
        }

        const fromUserAccount = await accountModel.findOne({
            user: req.user._id
        })

        if (!fromUserAccount) {
            return res.status(404).json({
                user: req.user,
                message: "System Account not found",
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

        if (toUserAccount.status != "ACTIVE") {
            return res.status(400).json({
                message: "Account is not active",
                status: false
            })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new transactionModel({
            fromAcoount: fromUserAccount._id,
            toAcoount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        })


        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            type: "DEBIT",
            amount,
            transaction: transaction._id,
            description: "Debit entry for transaction"
        }], { session })

        const creditLedgerEntry = await ledgerModel.create([{
            account: toUserAccount._id,
            type: "CREDIT",
            amount,
            transaction: transaction._id,
            description: "Credit entry for transaction"
        }], { session })

        transaction.status = "SUCCESS"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            message: "Initial Transaction created successfully",
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


async function getTransactionsController(req, res) {
    try {
        const userAccounts = await accountModel.find({ user: req.user._id })
        const accountIds = userAccounts.map(acc => acc._id)

        const transactions = await transactionModel.find({
            $or: [
                { fromAcoount: { $in: accountIds } },
                { toAcoount: { $in: accountIds } }
            ]
        }).sort({ createdAt: -1 }).populate("fromAcoount toAcoount")

        res.status(200).json({
            transactions,
            status: true
        })
    } catch (error) {
        console.error("Error fetching transactions:", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
}


async function getTransactionHistoryController(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            fromDate,
            toDate,
            type,
            status,
            accountId
        } = req.query

        const userAccounts = await accountModel.find({ user: req.user._id })
        const accountIds = userAccounts.map(acc => acc._id)

        if (accountIds.length === 0) {
            return res.status(200).json({
                transactions: [],
                total: 0,
                page: 1,
                totalPages: 0,
                status: true
            })
        }

        // Build base filter — transactions involving user's accounts
        const filter = {
            $or: [
                { fromAcoount: { $in: accountIds } },
                { toAcoount: { $in: accountIds } }
            ]
        }

        // Date range filter
        if (fromDate || toDate) {
            filter.createdAt = {}
            if (fromDate) filter.createdAt.$gte = new Date(fromDate)
            if (toDate) {
                const end = new Date(toDate)
                end.setHours(23, 59, 59, 999)
                filter.createdAt.$lte = end
            }
        }

        // Status filter
        if (status && ["PENDING", "SUCCESS", "FAILED", "REVERSED"].includes(status)) {
            filter.status = status
        }

        // Account filter
        if (accountId) {
            const accObjId = new mongoose.Types.ObjectId(accountId)
            filter.$or = [
                { fromAcoount: accObjId },
                { toAcoount: accObjId }
            ]
        }

        const skip = (parseInt(page) - 1) * parseInt(limit)

        let transactions = await transactionModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("fromAcoount toAcoount")

        const total = await transactionModel.countDocuments(filter)

        // If filtering by type (CREDIT/DEBIT), we determine direction relative to the user's accounts
        if (type && ["CREDIT", "DEBIT"].includes(type)) {
            const accountIdStrings = accountIds.map(id => id.toString())
            transactions = transactions.filter(tx => {
                const isDebit = accountIdStrings.includes(tx.fromAcoount?._id?.toString())
                if (type === "DEBIT") return isDebit
                if (type === "CREDIT") return !isDebit
                return true
            })
        }

        res.status(200).json({
            transactions,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            status: true
        })
    } catch (error) {
        console.error("Error fetching transaction history:", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
}


async function getTransactionReportController(req, res) {
    try {
        const { fromDate, toDate } = req.query

        const userAccounts = await accountModel.find({ user: req.user._id })
        const accountIds = userAccounts.map(acc => acc._id)

        if (accountIds.length === 0) {
            return res.status(200).json({
                summary: { totalCredits: 0, totalDebits: 0, netFlow: 0, totalTransactions: 0 },
                byStatus: {},
                monthlyBreakdown: [],
                status: true
            })
        }

        // Date filter for ledger and transactions
        const dateFilter = {}
        if (fromDate) dateFilter.$gte = new Date(fromDate)
        if (toDate) {
            const end = new Date(toDate)
            end.setHours(23, 59, 59, 999)
            dateFilter.$lte = end
        }

        // --- Summary from ledger ---
        const ledgerMatch = { account: { $in: accountIds } }
        if (Object.keys(dateFilter).length > 0) {
            ledgerMatch.createdAt = dateFilter
        }

        const summaryAgg = await ledgerModel.aggregate([
            { $match: ledgerMatch },
            {
                $group: {
                    _id: null,
                    totalCredits: {
                        $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] }
                    },
                    totalDebits: {
                        $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] }
                    },
                    totalTransactions: { $sum: 1 }
                }
            }
        ])

        const summary = summaryAgg.length > 0
            ? {
                totalCredits: summaryAgg[0].totalCredits,
                totalDebits: summaryAgg[0].totalDebits,
                netFlow: summaryAgg[0].totalCredits - summaryAgg[0].totalDebits,
                totalTransactions: summaryAgg[0].totalTransactions
            }
            : { totalCredits: 0, totalDebits: 0, netFlow: 0, totalTransactions: 0 }

        // --- Status breakdown from transactions ---
        const txMatch = {
            $or: [
                { fromAcoount: { $in: accountIds } },
                { toAcoount: { $in: accountIds } }
            ]
        }
        if (Object.keys(dateFilter).length > 0) {
            txMatch.createdAt = dateFilter
        }

        const statusAgg = await transactionModel.aggregate([
            { $match: txMatch },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ])

        const byStatus = {}
        statusAgg.forEach(s => { byStatus[s._id] = s.count })

        // --- Monthly breakdown from ledger ---
        const monthlyAgg = await ledgerModel.aggregate([
            { $match: ledgerMatch },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    credits: {
                        $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] }
                    },
                    debits: {
                        $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ])

        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthlyBreakdown = monthlyAgg.map(m => ({
            label: `${monthNames[m._id.month]} ${m._id.year}`,
            year: m._id.year,
            month: m._id.month,
            credits: m.credits,
            debits: m.debits,
            net: m.credits - m.debits,
            count: m.count
        }))

        res.status(200).json({
            summary,
            byStatus,
            monthlyBreakdown,
            status: true
        })
    } catch (error) {
        console.error("Error generating report:", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
}


module.exports = {
    createTransactionController,
    createSystemUserTransactionController,
    getTransactionsController,
    getTransactionHistoryController,
    getTransactionReportController
}
