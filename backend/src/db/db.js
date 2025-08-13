const mongoose = require("mongoose");

async function connectToDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
}

module.exports = connectToDB