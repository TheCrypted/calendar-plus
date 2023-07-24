import {getSuffix} from "../utils/timeMath.js";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export const DateComp = ({schedule, handleSelect, index, user, selectorRef, selected}) => {
	const [hover, setHover] = useState(false)
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const day = new Date(schedule.day)
	const navigate = useNavigate()

	return (
		<div onClick={()=>{
			if(!selectorRef) {
				navigate(`/Day/${user.name}?schedule=${schedule.id}&owner=${user.id}`)
			} else {
				handleSelect(index)
			}
		}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} key={schedule.id} className={"w-full hover:cursor-pointer z-0 h-32 " + selected +" drop-shadow-xl rounded-xl text-white flex flex-wrap items-center justify-center text-3xl font-extrabold"}>
			<div className="w-full h-4/6 flex z-0 flex-wrap items-center justify-center">{day.getDate()}<sup>{getSuffix(day.getDate())}</sup>
			</div>
			<div className="w-full h-2/6 rounded-b-xl z-0 bg-zinc-900 bg-opacity-50 text-xl flex items-center justify-center font-normal">
				{weekdays[day.getDay()]}
			</div>
			{/*{hover && <div className="bg-white absolute w-[200%] z-0 h-32">*/}

			{/*</div>}*/}
		</div>
	)
}