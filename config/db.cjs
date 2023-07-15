const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MODEL_URI;
const OPTIONS = {
    userNewUrlParser: true,
    useUnifiedTopology: true
};
const connectDB = async () => {
    try {
        await mongoose.connect(URI, OPTIONS);
        console.log("Successfully connected to DB")
    } catch (e){
        console.log("Failed to connect to DB", e)
        process.exit()
    }
}

module.exports = connectDB