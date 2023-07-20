const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const Events = require("../models/eventModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Preset = require("../models/presetModel.cjs")
const connectDB = require("../config/db.cjs");
const {stringTimeToInt, getAvailableTimes, intTimeToString} = require("../utils/time.cjs");
const router = express.Router();

router.get("/:scheduleId", async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.scheduleId);
        const schedule = await Schedule.findByPk(scheduleId);
        if(schedule){
            const events = await schedule.getEvents()
            events.sort((a, b) => stringTimeToInt(a.start) - stringTimeToInt(b.start))
            return res.status(200).json({message: "Schedule events found successfully", events});
        } else {
            return res.status(404).json({message: "Schedule not found"})
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
            console.log("Creating event auto")
            let availableSlots = await getAvailableTimes(event.scheduleModelId);
            const schedule = await Schedule.findByPk(event.scheduleModelId);
            let config = await schedule.getConfig();
            let pStart = stringTimeToInt(config.preferredStart)
            let newEvent = JSON.parse(JSON.stringify(event))
            availableSlots.reverse()
            for(let slot of availableSlots) {
                console.log(pStart)
                if(slot[1]-slot[0] > parseFloat(event.end) + config.minimumInterval*2){
                    newEvent.start = intTimeToString(slot[0] + config.minimumInterval)
                    newEvent.end = intTimeToString(stringTimeToInt(newEvent.start) + parseFloat(event.end))
                    if(slot[0] > pStart) {
                        break;
                    } else {
                        newEvent.start = intTimeToString(pStart)
                        newEvent.end = intTimeToString(stringTimeToInt(newEvent.start) + parseFloat(event.end))
                        break;
                    }
                }
            }
            if(newEvent.start === event.start){
                return res.status(404).json({message: "No available time to book event"})
            }
            // console.log(newEvent)
            await Events.create(newEvent)
        }
        return res.status(200).json({message: "Event logged successfully"});
    } catch (e){
        console.log("An error occurred while creating new event: ", e)
        return res.status(500).json({message: "Failed to create event"})
    }
})

module.exports = router;