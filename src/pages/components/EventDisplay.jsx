import {getDayPercent, intTimeToString, stringTimeToInt} from "../utils/timeMath.js";

export const EventDisplay = ({event}) => {
	return (
		<div style={{height: getDayPercent([stringTimeToInt(event.start), stringTimeToInt(event.end)]) + "%"}} className="flex w-full">
			<div className=" w-1/6 flex-col justify-end flex">
				{/*<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">{intTimeToString(timeBlock[0])}</div>*/}
				<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">
					{event.end}
				</div>
			</div>
			<div className="w-full h-full bg-red-500">

			</div>
		</div>
	)
}