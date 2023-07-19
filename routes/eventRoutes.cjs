const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const Events = require("../models/eventModel.cjs")
const Intermediary = require("../models/intermediary.cjs")
const Preset = require("../models/presetModel.cjs")
const connectDB = require("../config/db.cjs");
const router = express.Router();

router.get("/:scheduleId", async (req, res) => {
    try {
        const scheduleId = parseInt(req.params.scheduleId);
        const schedule = await Schedule.findByPk(scheduleId);
        if(schedule){
            const events = await schedule.getEvents()
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
        await Events.create(event);
        return res.status(200).json({message: "Event logged successfully"});
    } catch (e){
        console.log("An error occurred while creating new event: ", e)
        return res.status(500).json({message: "Failed to create event"})
    }
})

module.exports = router;