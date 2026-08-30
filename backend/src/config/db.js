const mongoose = require("mongoose");

async function connectDB() {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;

        if (!mongoUrl) {
            throw new Error("Missing MongoDB connection string. Set MONGO_URL or MONGODB_URI in backend/.env.");
        }

        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }

}

module.exports = connectDB