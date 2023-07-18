const sequelize = require("../config/db.cjs");
const User = require("./userModel.cjs");
const Schedule = require("./scheduleModel.cjs");
const Intermediary = require("./intermediary.cjs")
const {Model, DataTypes} = require("sequelize");

class Preset extends Model{}

Preset.init({
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize, modelName: "preset"
})

Preset.belongsToMany(Schedule, {through: Intermediary})
Preset.belongsTo(User)
User.hasMany(Preset)
Schedule.hasMany(Preset)

module.exports = Preset;