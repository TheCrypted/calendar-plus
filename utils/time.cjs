const Schedule = require("../models/scheduleModel.cjs");

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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

function formatDateToDDMMYYYY(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${day}-${month}-${year}`;
}

function getDay(date){
    return days[date.getDay()]
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
                // TODO: Maybe don't show the plot as available unless its greater than 1 hour?
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

module.exports = {stringTimeToInt, intTimeToString, getAvailableTimes, formatDateToDDMMYYYY, getDay};