const express = require('express');
const Schedule = require("../models/scheduleModel.cjs")
const User = require("../models/userModel.cjs")
const Config = require("../models/configModel.cjs")
const {authToken} = require("../middleware/auth.cjs");
const router = express.Router();

router.put("/update", authToken, async (req, res) => {
    try {
        const {config, scheduleStart, scheduleEnd} = req.body;
        const user = await User.findByPk(req.user.id);
        const userSchedules = await user.getScheduleModels({
            offset: scheduleStart,
            limit: scheduleEnd
        })
        const newConfig = await Config.create(config)
        await newConfig.addScheduleModels(userSchedules)
        return res.status(200).send({message: "Succesfully updated required configs", userSchedules})

    } catch (e){
        console.log(e)
        return res.status(404).json({message: "There was an error updating the config for the given days"})
    }
})

module.exports = router