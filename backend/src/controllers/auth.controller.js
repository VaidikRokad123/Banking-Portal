const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const BlacklistModel = require("../models/blacklist.model")


async function userRegisterController(req, res) {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
            status: false
        })
    }

    const isExist = await userModel.findOne({ email })

    if (isExist) {
        return res.status(422).json({
            message: "User already exists with this email",
            status: false
        })
    }

    const user = await new userModel({
        name, email, password
    })
    await user.save()


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })

    res.cookie("token", token)
    res.status(201).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token
    })

    await emailService.sendRegistrationEmail(email, name)

    // res.status(201).json({
    //     message: "User registered successfully",
    //     status: true
    // })

}

async function userLoginController(req, res) {

    const { email, password } = req.body


    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required",
            status: false
        })
    }

    const user = await userModel.findOne({ email }).select("+password +name")

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: false
        })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid password",
            status: false
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })

    res.cookie("token", token)
    res.status(200).json({
        user: {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        token
    })
    await emailService.sendLoginEmail(email, user.name)


}

async function userLogoutController(req, res) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
            status: false
        })
    }

    req.cookies.token = ""

    const blacklistedToken = await BlacklistModel.create({ token })

    res.clearCookie("token")
    res.status(200).json({
        message: "User logged out successfully",
        status: true
    })

}


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}
