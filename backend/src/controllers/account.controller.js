const accountModel = require("../models/account.model")

async function createAccountController(req, res) {

    const user = req.user
    const { currency } = req.body

    if (!user) {
        return res.status(400).json({
            message: "All fields are required",
            status: false
        })
    }

    // const account = await new accountModel({
    //     user,
    //     currency
    // })
    const account = await accountModel.create({
        user,
        currency
    })

    // console.log(account)

    await account.save()

    res.status(201).json({
        message: "Account created successfully",
        account,
        status: true
    })
}

async function getAccountsController(req, res) {
    try {
        const accounts = await accountModel.find({ user: req.user._id })
        res.status(200).json({
            accounts,
            status: true
        })
    } catch (error) {
        console.error("Error fetching accounts:", error)
        res.status(500).json({
            message: "Internal server error",
            status: false
        })
    }
}


module.exports = {
    createAccountController,
    getAccountsController
}