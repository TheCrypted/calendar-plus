const Schedule = require("../models/scheduleModel.cjs");

function stringTimeToInt(timeString) {
    const timeArr = timeString.split(":")
    return parseInt(timeArr[0]) + (parseInt(timeArr[1])/60)
}

function intTimeToString(timeInt) {
    const decimal = timeInt % 1;
    const hour = Math.floor(timeInt)
    const minute = decimal * 60
    return hour.toString() + ":" + minute.toString().padStart(2, "0")
}

async function getAvailableTimes(scheduleID) {
    try {
        let schedule = await Schedule.findByPk(scheduleID)
        let events = await schedule.getEvents()
        events.sort((a, b) => stringTimeToInt(a.start) - stringTimeToInt(b.start))
        let availableSlots = []
        let last = schedule.dayStart
        for (let event of events) {
            const available = [last, stringTimeToInt(event.start)]
            last = stringTimeToInt(event.end)
            if (available[1] - available[0] >= 1) {

            }
            availableSlots.push(available)
        }
        if (schedule.dayEnd - last > 0.5) {
            availableSlots.push([last, schedule.dayEnd])
        }
        return availableSlots
    } catch (e){
        console.log(e)
        return null
    }
}

module.exports = {stringTimeToInt, intTimeToString, getAvailableTimes};