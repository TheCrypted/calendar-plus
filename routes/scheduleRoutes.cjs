const express = require('express')
const Schedule = require("../models/scheduleModel.cjs")
const User = require("../models/userModel.cjs")
const Preset = require("../models/presetModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Events = require("../models/eventModel.cjs")
const Config = require("../models/configModel.cjs")
const connectDB = require("../config/db.cjs");
const {authToken} = require("../middleware/auth.cjs");
const querystring = require("querystring");
const {stringTimeToInt, getAvailableTimes, formatDateToDDMMYYYY, getDay} = require("../utils/time.cjs");
const {sendEmail} = require("../utils/mailer.cjs");
const {DataTypes, Op} = require("sequelize");
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
            let configs = []
            for(let schedule of userSchedules){
                let config = await schedule.getConfig();
                configs.push(config)
            }
            return res.status(200).json({
                userSchedules,
                configs
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
            return res.status(401).json({message: "Unauthorized to delete"})
        }
    } catch (e){
        console.log(e)
        return res.status(404).json({message: "There was an error deleting presets"})
    }
})

router.delete("/:scheduleID", authToken, async(req, res) => {
    try {
        const scheduleID = parseInt(req.params.scheduleID);
        const schedule = await Schedule.findByPk(scheduleID);
        const subject = `Your booking on ${getDay(schedule.day)}, ${formatDateToDDMMYYYY(schedule.day)} has been cancelled `
        if (req.user.id !== schedule.userModelId) {
            return res.status(401).json({message: "Unauthorized to clear schedule"})
        }
        const events = await Events.findAll({
            where: {
                scheduleModelId: scheduleID
            }
        })
        for( let event of events ) {
            await sendEmail(event.clientEmail, req.user.name, subject, "cancellation");
            await event.destroy()
        }
        return res.status(200).json({message: "Successfully deleted events for the day"})
    } catch (e) {
        console.log(e)
        return res.status(404).json({message: "There was an error deleting events for the schedule"})
    }
})

router.get("/available", async (req, res) => {
    try {
        const urlParsed = new URL("http:/localhost/schedules" + req.url)
        const scheduleID = parseInt(urlParsed.searchParams.get("schedule"))
        let availableSlots = await getAvailableTimes(scheduleID)
        return res.status(200).json({message:"Successfully collated available times", availableSlots})
    } catch (e){
        console.log(e)
        return res.status(500).json({message: "There was an error getting available times"})
    }
})

router.get("/first/:n", authToken, async (req, res) => {
    try {
        const n = parseInt(req.params.n)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const schedules = await Schedule.findAll({
            where: {
                userModelId: req.user.id,
                day: {
                    [Op.gt]: yesterday
                }
            }
        })
        let events = []
        let count = 0
        for (let schedule of schedules){
            const schEvents = await schedule.getEvents()
            for(let event of schEvents){
                let newEvent = JSON.parse(JSON.stringify(event));
                newEvent.day = schedule.day
                events.push(newEvent)
                if(events.length === n ||count > 10 ){
                    return res.status(200).json({message:"Successfully closest", events})
                }
            }
            count++;
        }
        return res.status(200).json({message:"Successfully closest", events})
    } catch (e){
        console.log(e)
        return res.status(500).json({message: "There was an error getting first n events"})
    }

})

router.put("/weekends", authToken, async(req, res)=>{
    try {
        const makePrivate = req.headers.makeprivate === "true"
        let weekends = []
        const user = await User.findOne({
            where: {
                id: req.user.id
            }
        })
        const schedules = await user.getScheduleModels()
        for(let schedule of schedules){
            if(schedule.day.getDay() === 0 || schedule.day.getDay() === 6){
                let config = await schedule.getConfig()
                let configNew = await Config.create({
                    isPrivate: makePrivate,
                    preferredStart: config.preferredStart,
                    preferredEnd: config.preferredEnd,
                    breakStart: config.breakStart,
                    breakDuration: config.breakDuration,
                    minimumInterval: config.minimumInterval
                })
                await configNew.addScheduleModel(schedule)
                weekends.push(schedule)
            }
        }
        return res.status(200).json({message: "Successfully changed weekend configurations", weekends})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "There was an error privating weekends"})
    }

})

router.post("/create", authToken, async (req, res) => {
    try {
        let existingSchedules = await Schedule.findAll({
            where: {
                userModelId: req.user.id
            },
            order: [["createdAt", "DESC"]]
        })
        const date = existingSchedules.length > 0 ? existingSchedules[0].day : req.body.date
        const {amount} = req.body
        let createdSchedules = []
        let userScheduleInit = {
                userModelId: req.user.id,
                day: date,
                dayStart: 8,
                dayEnd: 18
            }
        const configNew = await Config.create({
                isPrivate: false,
                minimumInterval: 0
        })
        for (let i = 0; i < amount; i++) {
            let newDate = new Date(date)
            newDate.setDate(newDate.getDate() + i + 1)
            userScheduleInit.day = newDate
            let newSchedule = await Schedule.create(userScheduleInit)
            createdSchedules.push(newSchedule)
        }
        await configNew.addScheduleModels(createdSchedules)

        return res.status(200).json({message: "Successfully created schedules", createdSchedules, configs: Array(createdSchedules.length).fill(configNew)})
    } catch (e){
        console.log(e)
        return res.status(500).json({message: "There was an error creating schedules for the next month"})
    }
})


module.exports = router;