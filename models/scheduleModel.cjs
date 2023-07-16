const sequelize = require("../config/db.cjs");
const User = require("./userModel.cjs")
const {Model, DataTypes} = require("sequelize");
class Schedule extends Model {}
Schedule.init({
    userModelId: {
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
        type: DataTypes.INTEGER,
        required: true
    },
    dayEnd: {
        type: DataTypes.INTEGER,
        required: true
    }
}, {
    sequelize, modelName: "scheduleModel"
})

User.hasMany(Schedule, {sourceKey: "id", targetKey: "user"})
// Schedule.belongsTo(User, {foreignKey: "id", sourceKey: "user", targetKey: "id"})
module.exports = Schedule