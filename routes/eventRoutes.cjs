const express = require('express');
const cron  = require('node-cron');
const Schedule = require("../models/scheduleModel.cjs")
const Events = require("../models/eventModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Preset = require("../models/presetModel.cjs")
const connectDB = require("../config/db.cjs");
const {stringTimeToInt, getAvailableTimes, intTimeToString} = require("../utils/time.cjs");
const {checkAuth, authToken} = require("../middleware/auth.cjs");
const User = require("../models/userModel.cjs");
const {pushEventToSchedule, pushSpecEventToSchedule} = require("../utils/eventHandling.cjs");
const {sendEmail} = require("../utils/mailer.cjs");
const router = express.Router();

router.get("/:scheduleId", async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.scheduleId);
        const schedule = await Schedule.findByPk(scheduleId);
        const authStatus = await checkAuth(req.headers.auth)
        if(!schedule){
            return res.status(404).json({message: "Schedule not found"})
        }
        const config = await schedule.getConfig()
        if(!config.isPrivate || authStatus.id === schedule.userModelId) {
            const events = await schedule.getEvents()
            events.sort((a, b) => stringTimeToInt(a.start) - stringTimeToInt(b.start))
            return res.status(200).json({message: "Schedule events found successfully", events, isPrivate: false, schedule});
        } else {
            return res.status(404).json({message: "Schedule is private", isPrivate: true})
        }
    } catch (e){
        console.log("An error occurred while getting events: ", e)
        return res.status(500).json({message: "Failed to get events"})
    }
})

router.get("/presets/:scheduleId", async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.scheduleId);
        const inters = await Intermediary.findAll({
            where: {
                scheduleModelId: scheduleId
            }
        })
        let presets = [];
        for(let model of inters){
            let preset = await Preset.findOne({
                where:{
                    id: model.presetId
                }
            })
            presets.push(preset)
        }
        return res.status(200).json({
            message: "Schedule presets found successfully",
            presets
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "Failed to get presets"});
    }
})
router.post("/newevents", async (req, res) => {
    try {
        const {event} = req.body
        let answer = event.start.toLowerCase() === "auto" ? await pushEventToSchedule(event, req.headers.auth) : await pushSpecEventToSchedule(event, req.headers.auth)
        if (!answer.ok) {
            return res.status(500).json({message: answer.message})
        }
        return res.status(200).json({message: "Event logged successfully"});
    } catch (e){
        console.log("An error occurred while creating new event: ", e)
        return res.status(500).json({message: "Failed to create event"})
    }
})

router.post("/multiple", authToken, async(req, res) => {
    try {
        let {event} = req.body
        let bouncedDates = []
        event.userModelId = parseInt(req.user.id)
        const urlParsed = new URL("http:/localhost/events" + req.url);
        const schedules = await Schedule.findAll({
            where: {
                userModelId: parseInt(req.user.id)
            },
            offset: parseInt(urlParsed.searchParams.get("start")),
            limit: parseInt(urlParsed.searchParams.get("end"))
        })
        for (let schedule of schedules) {
            event.scheduleModelId = parseInt(schedule.id)
            let answer = event.start.toLowerCase() === "auto" ? await pushEventToSchedule(event, req.headers.auth) : await pushSpecEventToSchedule(event, req.headers.auth)
            if (!answer.ok) {
                console.log(answer.message)
                bouncedDates.push(schedule.day)
            }
        }
        if(bouncedDates.length === schedules.length){
            return res.status(500).json({message: "No events added (possibly because all schedules are full"})
        }
        return res.status(200).json({message: "Events created successfully", bouncedDates})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "Failed to create events"})
    }
})

router.post("/notify", authToken, async(req, res)=>{
    try {
        const url = new URL("http://localhost:3000/events" + req.url)
        const eventID = parseInt(url.searchParams.get("id"))
        const event = await Events.findByPk(eventID)
        const schedule = await event.getScheduleModel()
        if(req.user.id !== schedule.userModelId){
            return res.status(401).json({message: "Unauthorized to schedule notification"})
        }
        if(schedule.day < new Date()){
            return res.status(403).json({message: "Cannot send a reminder for a past event"})
        }
        let dateReminder = intTimeToString(stringTimeToInt(event.start) - 0.5) // Send a reminder 30 minutes before meeting
        let eventMinutes = dateReminder.split(":")[1].charAt(0) === "0" ? dateReminder.split(":")[1].charAt(1) : dateReminder.split(":")[1]
        let eventHour = dateReminder.split(":")[0].charAt(0) === "0" ? dateReminder.split(":")[0].charAt(1) : dateReminder.split(":")[0]
        let timeString = `${eventMinutes} ${eventHour} ${schedule.day.getDate()} ${schedule.day.getMonth()+1} * ${schedule.day.getFullYear()}`
        const myTask = async () => {
            // await sendEmail(req.user.email, event.clientEmail, `You have an event in 15 minutes scheduled by ${event.clientEmail} (${event.title})`, "notification")
            // TODO: uncomment above line, commented just ot prevent annoyance
            cronMail.stop()
        }
        const cronMail = cron.schedule(timeString, myTask)
        cronMail.start()

        return res.status(200).json({message: "Succesfully scheduled notification", timeString})
    } catch (e){
        console.log(e)
        return res.status(500).json({message: "Failed to schedule notification"})
    }

})

module.exports = router;