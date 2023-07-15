const sequelize = require("../config/db.cjs");
const {Model, DataTypes} = require("sequelize");
class User extends Model {}
User.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize, modelName: "userModel"
})

module.exports = User