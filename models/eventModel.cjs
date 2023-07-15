const Mongoose = require("mongoose");

const eventSchema = new Mongoose.Schema({
    clientEmail: {
        type: String,
        required: true
    },
    userID: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
    },
    schedule: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Schedule"
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
})

module.exports = Mongoose.model("Event", eventSchema)