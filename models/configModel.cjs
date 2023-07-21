const {Model, DataTypes} = require("sequelize");
const Schedule = require("./scheduleModel.cjs");
const sequelize = require("../config/db.cjs")

class Config extends Model{}

Config.init({
    isPrivate: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    preferredStart: {
        type: DataTypes.STRING,
        allowNull: true
    },
    preferredEnd: {
        type: DataTypes.STRING,
        allowNull: true
    },
    breakStart: {
        type: DataTypes.STRING,
        allowNull: true
    },
    breakDuration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    minimumInterval: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize, modelName: "config"
})

Config.hasMany(Schedule);
Schedule.belongsTo(Config);


module.exports = Config