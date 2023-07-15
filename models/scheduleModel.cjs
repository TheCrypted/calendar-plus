const sequelize = require("../config/db.cjs");
const User = require("./userModel.cjs")
const {Model, DataTypes} = require("sequelize");
class Schedule extends Model {}
Schedule.init({
    user: {
        type: DataTypes.INTEGER,
        required: true,
        references: {
            model: User,
            key: "id"
        }
    },
    day: {
        type: DataTypes.DATE,
        required: true
    },
    dayStart: {
        type: DataTypes.DATE,
        required: true
    },
    dayEnd: {
        type: DataTypes.DATE,
        required: true
    },
    duration: {
        type: DataTypes.DATE,
        required: true
    }
}, {
    sequelize, modelName: "scheduleModel"
})

Schedule.belongsTo(User, {foreignKey: "id", sourceKey: "user", targetKey: "id"})
module.exports = Schedule