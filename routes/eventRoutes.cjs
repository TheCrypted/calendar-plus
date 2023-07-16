const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const router = express.Router();

router.get("/:scheduleId", async (req, res) => {
    try {
        const scheduleId = req.params.scheduleId;
        const schedule = await Schedule.findByPk(scheduleId);
        if(schedule){
            const events = schedule.getEvents()
            return res.status(200).json({message: "Schedule events found successfully", events});
        } else {
            return res.status(404).json({message: "Schedule not found"})
        }
    } catch (e){
        console.log("An error occurred while getting events: ", e)
        return res.status(500).json({message: "Failed to get events"})
    }
})

module.exports = router;