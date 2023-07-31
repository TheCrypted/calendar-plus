import {getDayPercent, intTimeToString, stringTimeToInt, to12h} from "../utils/timeMath.js";

export const EventDisplay = ({event}) => {
	const colourRange = [
		// Red shades
		'bg-red-500',
		'bg-red-700',

		// Orange shades
		'bg-orange-500',
		'bg-orange-700',

		// Yellow shades
		'bg-yellow-500',
		'bg-yellow-700',

		// Green shades
		'bg-green-500',
		'bg-green-700',

		// Blue shades
		'bg-blue-500',
		'bg-blue-700',

		// Indigo shades
		'bg-indigo-500',
		'bg-indigo-700',

		// Purple shades
		'bg-purple-500',
		'bg-purple-700',

		// Pink shades
		'bg-pink-500',
		'bg-pink-700',
	].reverse()
	const dayPercent = getDayPercent([stringTimeToInt(event.start), stringTimeToInt(event.end)])
	const colorToUse = colourRange[Math.floor(dayPercent/100 * colourRange.length)]
	return (
		<div style={{height: dayPercent + "%"}} className="flex w-full">
			<div className=" w-1/5 flex-col justify-end flex">
				{/*<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">{intTimeToString(timeBlock[0])}</div>*/}
				<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">
					{event.end}
				</div>
			</div>
			<div className={`w-full h-full `+ colorToUse +` bg-opacity-50 flex`}>
				<div style={{fontSize: dayPercent * 1.3 + "px"}} className="w-[12%] font-bold [writing-mode:vertical-lr] text-white flex items-start pl-3 justify-center">
					{to12h(event.start)}
				</div>
				<div className="w-full h-full text-white grid grid-rows-[40%_10%_50%]">
					<div className="text-white text-2xl font-bold flex items-center">
						{event.title}
					</div>
					<div className="text-white text-md font-normal flex items-center opacity-70">
						Scheduled by: {event.clientEmail}
					</div>
				</div>
			</div>
		</div>
	)
}