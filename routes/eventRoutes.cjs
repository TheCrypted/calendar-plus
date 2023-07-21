const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const Events = require("../models/eventModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Preset = require("../models/presetModel.cjs")
const connectDB = require("../config/db.cjs");
const {stringTimeToInt, getAvailableTimes, intTimeToString} = require("../utils/time.cjs");
const {checkAuth, authToken} = require("../middleware/auth.cjs");
const User = require("../models/userModel.cjs");
const {pushEventToSchedule} = require("../utils/eventHandling.cjs");
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
        console.log(schedule.userModelId)
        if(!config.isPrivate || authStatus.id === schedule.userModelId) {
            const events = await schedule.getEvents()
            events.sort((a, b) => stringTimeToInt(a.start) - stringTimeToInt(b.start))
            return res.status(200).json({message: "Schedule events found successfully", events, isPrivate: false});
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
        if(event.start !== "auto") {
            // TODO: change this so you verify that the time is even acceptable
            await Events.create(event);
        } else {
            let answer = await pushEventToSchedule(event, req.headers.auth)
            if (!answer.ok){
                return res.status(404).json({message: answer.message});
            }
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
        event.userModelId = parseInt(req.user.id)
        const urlParsed = new URL("http:/localhost/events" + req.url);
        // const user = User.findByPk(parseInt(req.user.id));
        const schedules = Schedule.findAll({
            where: {
                userModelId: parseInt(req.user.id)
            },
            offset: parseInt(urlParsed.searchParams.get("start")),
            limit: parseInt(urlParsed.searchParams.get("end"))
        })
        return res.status(200).json({message: "Events created successfully", schedules})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "Failed to create events"})
    }
})

module.exports = router;