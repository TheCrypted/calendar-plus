export function getSuffix(number){
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return "th";
    } else {
        switch (lastDigit) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }
}
export function getDayPercent(timeBlock){
    return Math.max(Math.round((timeBlock[1]-timeBlock[0])*10), 8)
}
export function to12h(time){
    const firstDigit = parseInt(time.split(":")[0])
    if(firstDigit > 12){
        return `${firstDigit-12}:00 pm`
    }
    return `${time} am`
}
export function stringTimeToInt(timeString) {
    const timeArr = timeString.split(":")
    return parseInt(timeArr[0]) + (parseInt(timeArr[1])/60)
}

export function intTimeToString(timeInt) {
    const decimal = timeInt % 1;
    const hour = Math.floor(timeInt)
    const minute = decimal * 60
    return hour.toString() + ":" + minute.toString().padStart(2, "0")
}