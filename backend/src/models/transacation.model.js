const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({

    fromAcoount:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "From account is required"],
        index: true
    },
    toAcoount:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "To account is required"],
        index: true
    },
    amount:
    {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be greater than 0"]
    },
    status:
    {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "REVERSED"],
        default: "PENDING"
    },
    idempotencyKey:
    {
        type: String,
        required: [true, "Idempotency key is required"],
        index: true,
        unique: true
    }


},
    {
        timestamps: true
    }
)


const transactionModel = mongoose.model("Transaction", transactionSchema)

module.exports = transactionModel

