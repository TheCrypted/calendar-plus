const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const Events = require("../models/eventModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Preset = require("../models/presetModel.cjs")
const connectDB = require("../config/db.cjs");
const {stringTimeToInt, getAvailableTimes, intTimeToString} = require("../utils/time.cjs");
const {checkAuth, authToken} = require("../middleware/auth.cjs");
const User = require("../models/userModel.cjs");
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
            // TODO: change this so that when the event is created through a preset the Event.end works is changed to required HH:MM format
            await Events.create(event);
        } else {
            let availableSlots = await getAvailableTimes(event.scheduleModelId);
            const schedule = await Schedule.findByPk(event.scheduleModelId);
            let config = await schedule.getConfig();
            const authStatus = await checkAuth(req.headers.auth)
            if(!config.isPrivate || authStatus.id === schedule.userModelId) {
                let pStart, pEnd
                let preferenceExists = !!config.preferredStart
                if(preferenceExists) {
                    pStart = stringTimeToInt(config.preferredStart)
                    pEnd =  stringTimeToInt(config.preferredEnd)
                }
                let newEvent = JSON.parse(JSON.stringify(event))
                availableSlots.reverse()
                for (let slot of availableSlots) {
                    if (slot[1] - slot[0] >= parseFloat(event.end) + config.minimumInterval * 2) {
                        newEvent.start = intTimeToString(slot[0] + config.minimumInterval)
                        newEvent.end = intTimeToString(stringTimeToInt(newEvent.start) + parseFloat(event.end))
                        if (preferenceExists && slot[0] > pStart) {
                            break;
                        } else if (preferenceExists && slot[1] - pStart > parseFloat(event.end) + config.minimumInterval * 2) {
                            newEvent.start = intTimeToString(pStart)
                            newEvent.end = intTimeToString(stringTimeToInt(newEvent.start) + parseFloat(event.end))
                            break;
                        }
                    }
                }
                if (newEvent.start === event.start) {
                    return res.status(404).json({message: "No available time to book event"})
                }
                // console.log(newEvent)
                await Events.create(newEvent)
            } else {
                return res.status(401).json({message: "Not authorized to book event"})
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

    } catch (e) {
        console.log(e)
        return res.status(500).json({message: "Failed to create events"})
    }

})

module.exports = router;