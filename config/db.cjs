const {Sequelize} = require("sequelize");

const meetingDB = new Sequelize("calendarDb", "Aman04", "TheCrypted", {
    dialect: "sqlite",
    host: "./config/dbMain.sqlite"
})

module.exports = meetingDB