const sequelize = require("../config/db.cjs");
const Schedule = require("./scheduleModel.cjs");
const {Model, DataTypes} = require("sequelize");
const User = require("./userModel.cjs");

class Event extends Model{}
Event.init({
    clientEmail: {
        type: String,
        required: true
    },
    user: {
        type: DataTypes.INTEGER,
        required: true,
        references: {
            model: User,
            key: "id"
        }
    },
    title: {
        type: DataTypes.STRING,
        required: true
    },
    description: {
        type: DataTypes.STRING,
        required: false,
    },
    schedule: {
        type: DataTypes.INTEGER,
        required: true,
        references: {
            model: Schedule,
            key: "id"
        }
    },
    start: {
        type: DataTypes.DATE,
        required: true
    },
    end: {
        type: DataTypes.DATE,
        required: true
    }
}, {
    sequelize, modelName: "eventModel"
})

Event.belongsTo(User, {foreignKey: "id", sourceKey: "user", targetKey: "id"})
Event.belongsTo(Schedule, {foreignKey: "id", sourceKey: "schedule", targetKey: "id"})
module.exports = Event