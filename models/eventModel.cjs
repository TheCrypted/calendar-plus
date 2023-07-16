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
    userModelId: {
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
    scheduleModelId: {
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
    sequelize, modelName: "event"
})

Event.belongsTo(User);
Event.belongsTo(Schedule);
User.hasMany(Event);
Schedule.hasMany(Event);
module.exports = Event;