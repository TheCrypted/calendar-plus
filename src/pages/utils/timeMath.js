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

export function to12h(time){
    const firstDigit = parseInt(time.split(":")[0])
    if(firstDigit > 12){
        return `${firstDigit-12}:00 pm`
    }
    return `${time} am`
}
