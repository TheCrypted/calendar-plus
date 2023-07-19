const express = require('express')
const Schedule = require("../models/scheduleModel.cjs")
const User = require("../models/userModel.cjs")
const Preset = require("../models/presetModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const connectDB = require("../config/db.cjs");
const {authToken} = require("../middleware/auth.cjs");
const querystring = require("querystring");
const {stringTimeToInt} = require("../utils/time.cjs");
const router = express.Router();
connectDB.sync().then((data)=> console.log("DB is synced and ready scheduleRoutes")).catch(err => console.log(err))

router.get("/all", authToken, async function(req, res) {
    try{
        const userID = req.user.id
        const user = await User.findOne({
            where: {
                id: userID
            }
        });
        if(user) {
            const userSchedules = await user.getScheduleModels();
            return res.status(200).json({
                userSchedules
            })
        } else {
            return res.status(404).json({message: "User not found"})
        }
    } catch(e){
        console.log(e)
        return res.status(404).json({message: "There was an error getting schedules"})
    }
})

router.post("/setpresets", authToken, async function(req, res) {
    try {
        const {startIndex, endIndex, preset} = req.body
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        })
        const schedules = await user.getScheduleModels();
        const presetSchedules = schedules.slice(startIndex, endIndex);
        const presetCreated = await Preset.create(preset);
        presetCreated.addScheduleModels(presetSchedules);
        return res.status(200).json({message: "Successfully created preset"})
    } catch (e){
        console.log(e)
        return res.status(404).json({message: "There was an error creating presets"})
    }
})

router.delete("/preset", authToken, async function(req, res) {
    try {
        const urlParsed = new URL("http:/localhost/schedules" + req.url);
        const scheduleDeletionID = parseInt(urlParsed.searchParams.get("schedule"))
        const presetDeletionID = parseInt(urlParsed.searchParams.get("preset"))
        const schedule = await Schedule.findByPk(scheduleDeletionID)
        if(req.user.id === schedule.userModelId) {
            await Intermediary.destroy({
                where: {
                    scheduleModelId: scheduleDeletionID,
                    presetId: presetDeletionID
                }
            })
            return res.status(200).json({message: "Successfully deleted preset"})
        } else {
            return res.status(200).json({message: "Unauthorized to delete"})
        }
    } catch (e){
        console.log(e)
        return res.status(404).json({message: "There was an error deleting presets"})
    }
})

router.get("/available", async (req, res) => {
    try {
        const urlParsed = new URL("http:/localhost/schedules" + req.url)
        const scheduleID = parseInt(urlParsed.searchParams.get("schedule"))
        let schedule = await Schedule.findByPk(scheduleID)
        let events = await schedule.getEvents()
        events.sort((a, b) => stringTimeToInt(a.start) - stringTimeToInt(b.start))
        let availableSlots = []
        let last = schedule.dayStart
        for(let event of events){
            const available = [last, stringTimeToInt(event.start)]
            last = stringTimeToInt(event.end)
            if(available[1] - available[0] >= 1){

            }
            availableSlots.push(available)
        }
        if( schedule.dayEnd - last > 1.5){
            availableSlots.push([last, schedule.dayEnd])
        }
        return res.status(200).json({message:"Successfully collated available times", availableSlots})
    } catch (e){
        console.log(e)
        return res.status(404).json({message: "There was an error getting available times"})
    }
})

module.exports = router;