function stringTimeToInt(timeString) {
    const timeArr = timeString.split(":")
    return parseInt(timeArr[0]) + (parseInt(timeArr[1])/60)
}

module.exports = {stringTimeToInt};