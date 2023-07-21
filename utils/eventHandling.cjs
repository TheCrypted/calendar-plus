const {getAvailableTimes, stringTimeToInt, intTimeToString} = require("./time.cjs");
const Schedule = require("../models/scheduleModel.cjs");
const {checkAuth} = require("../middleware/auth.cjs");
const Events = require("../models/eventModel.cjs");
const Config = require("../models/configModel.cjs");

async function pushEventToSchedule(event, token){
    let availableSlots = await getAvailableTimes(event.scheduleModelId);
    const schedule = await Schedule.findByPk(event.scheduleModelId);
    let config = await schedule.getConfig();
    const authStatus = await checkAuth(token)
    if (!config.isPrivate || authStatus.id === schedule.userModelId) {
        let pStart, pEnd
        let preferenceExists = !!config.preferredStart
        if (preferenceExists) {
            pStart = stringTimeToInt(config.preferredStart)
            pEnd = stringTimeToInt(config.preferredEnd)
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
            return {message: "No available time to book event", ok: false}
        }
        await Events.create(newEvent)
    } else {
        return {message: "Not authorized to book event", ok: false}
    }
    return {message: "Success", ok: true}
}

async function pushSpecEventToSchedule(event, token){
    const authStatus = await checkAuth(token)
    let newEvent = JSON.parse(JSON.stringify(event))
    let schedule = await Schedule.findOne({
        where: {
            id: event.scheduleModelId
        },
        include: {
            model: Config,
            attributes: ["isPrivate", "minimumInterval"]
        }
    })
    if(!schedule.dataValues.config.isPrivate || authStatus.id === schedule.dataValues.userModelId){
        const availableSlots = await getAvailableTimes(schedule.id)
        const eventStart = stringTimeToInt(newEvent.start)
        let slotFound = false
        newEvent.end = intTimeToString(eventStart + parseInt(newEvent.end))
        const eventEnd = stringTimeToInt(newEvent.end)
        for(let slot of availableSlots){
            if( eventStart > slot[0] && eventEnd < slot[1]){
                await Events.create(newEvent)
                slotFound = true
                break;
            }
        }
        if(!slotFound){
            return {message: "No available time to book event", ok: false}
        }
    } else {
        return {message: "Not authorized to create event", ok: false}
    }
    return {message: "Success", ok: true}
}

module.exports = {pushEventToSchedule, pushSpecEventToSchedule}