const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.cjs");
const scheduleRoutes = require("./routes/scheduleRoutes.cjs");
const connectDB = require("./config/db.cjs")
const {urlencoded} = require("express");
const Schedules = require("./models/scheduleModel.cjs")
require("dotenv").config();
const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({extended: true}));
app.use("/auth", authRoutes);
app.use("/schedules", scheduleRoutes);
connectDB.sync().then((data)=> console.log("DB is synced and ready")).catch(err => console.log(err))

const init = async()=>{
    // const date = new Date()
    // let userSchedule1 = {
    //     userModelId: 1,
    //     day: date,
    //     dayStart: 9,
    //     dayEnd: 17
    // }
    // for(let i = 0; i < 28; i ++) {
    //     date.setDate(date.getDate() + 1)
    //     userSchedule1.day = date
    //     console.log(date)
    //     await Schedules.create(userSchedule1)
    // }

    app.listen(PORT, ()=>{
        console.log(`App is running on Port: ${PORT}`);
    })
}

init().catch((error) => {
    console.error('Error occurred during app initialization:', error);
});