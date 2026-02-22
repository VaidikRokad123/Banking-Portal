const mongoose = require("mongoose")



const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    blacklistedAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    }
},
    {
        timestamps: true
    }
)


blacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

const BlacklistModel = mongoose.model("Blacklist", blacklistSchema)

module.exports = BlacklistModel