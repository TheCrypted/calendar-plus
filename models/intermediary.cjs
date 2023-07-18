const sequelize = require("../config/db.cjs");
const {Model} = require("mongoose");

class Intermediary extends Model {}

Intermediary.init({}, { sequelize, modelName: 'intermediary' });

module.exports = Intermediary