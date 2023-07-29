import {useEffect, useRef, useState} from "react";
import {PresetForm} from "./components/PresetForm.jsx";
import {Header} from "./components/Header.jsx";
import {Link, useNavigate} from "react-router-dom";
import {getDayPercent, getSuffix, intTimeToString} from "./utils/timeMath.js";
import {EventDisplay} from "./components/EventDisplay.jsx";

export const UserDay = () => {
	const [events, setEvents] = useState([])
	const [scheduleOwner, setScheduleOwner] = useState(null)
	const [schedule, setSchedule] = useState(null)
	const [presets, setPresets] = useState([])
	const [selectedPreset, setSelectedPreset] = useState(null)
	const [availableTimes, setAvailableTimes] = useState([])
	const [topNews, setTopNews] = useState([])
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const emailRef = useRef(null);
	const titleRef = useRef(null);
	const scrollRef = useRef(null);
	const descriptionRef = useRef(null);
	const startRef = useRef(null);
	const endRef = useRef(null);
	const searchParams = new URLSearchParams(location.search);
	const scheduleID = searchParams.get("schedule");
	const authRef = useRef(false);
	const dayRef = useRef(null);
	const privateRef = useRef(false);
	const currentTextRef = useRef("Thursday");
	const navigate = useNavigate()
	const getAvailableTimes = async () => {
		let response = await fetch(`http://localhost:3000/schedules/available?schedule=${scheduleID}`, {
			method: "GET",
			headers: {
				"Content-type": "application/json"
			}
		})
		let resp = await response.json();
		if(!response.ok){
			console.log(resp.message);
		} else {
			setAvailableTimes(resp.availableSlots)
		}
	}
	useEffect(() => {
		const token = localStorage.getItem("token");
		setScheduleOwner(searchParams.get("owner"));
		const verifyAdminAccess = async () => {
			let response = await fetch("http://localhost:3000/auth/protected", {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					auth: token
				}
			})
			const resp = await response.json();
			let origOwner = searchParams.get("owner");
			if(response.ok && resp.user.id === parseInt(origOwner)) {
				authRef.current = true
			}
		}
		const getPresets = async ()=> {
			let response = await fetch(`http://localhost:3000/events/presets/${scheduleID}`, {
				method: "GET",
				headers: {
					"Content-type": "application/json"
				}
			})
			const resp = await response.json()
			if(response.ok){
				setPresets(resp.presets)
			} else {
				console.log(resp)
			}
		}
		const getNewsTop = async () => {
			let response = await fetch(`https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=10ed9346cf104d98b85824d992c8512d`)
			let resp = await response.json();
			if(!response.ok){
				console.log(resp)
			} else {
				setTopNews(resp.articles)
			}
		}
		const getEvents = async ()=> {
			const token = localStorage.getItem("token")
			let response = await fetch(`http://localhost:3000/events/${scheduleID}`, {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					auth: token
				}
			})
			const resp = await response.json()
			if(response.ok){
				setEvents(resp.events)
				setSchedule(new Date(resp.schedule.day))
				//Changing the required day value according to which schedule we are in
				let date = new Date(resp.schedule.day)
				dayRef.current.innerText = weekdays[date.getDay()]
				currentTextRef.current = weekdays[date.getDay()]
			} else {
				if(resp.isPrivate){
					privateRef.current = true
				}
				console.log(resp)
			}
		}
		// setInterval(handleClickScroll, 3000)
		getEvents()
		getPresets()
		verifyAdminAccess()
		getNewsTop()
		getAvailableTimes()
	}, [])
	const submitForm = async () => {
		const searchParams = new URLSearchParams(location.search);
		const token = localStorage.getItem("token")
		const scheduleID = searchParams.get("schedule");
		const event = {
			clientEmail: emailRef.current.value,
			userModelId: parseInt(scheduleOwner),
			title: titleRef.current.value,
			description: descriptionRef.current.value,
			scheduleModelId: parseInt(scheduleID),
			start: startRef.current.value,
			end: endRef.current.value
		}
		let response = await fetch("http://localhost:3000/events/newevents", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				auth: token
			},
			body: JSON.stringify({
				event
			})
		})
		let resp = await response.json();
		if(!response.ok){
			alert(resp.message)
		} else {
			location.reload()
		}
	}
	const deletePreset = async (presetID)=>{
		const token = localStorage.getItem("token");
		let response = await fetch(`http://localhost:3000/schedules/preset?schedule=${scheduleID}&preset=${presetID}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				auth: token
			}
		})
		let resp = await response.json()
		if(!response.ok){
			alert(resp.message)
		} else {
			location.reload()
		}
	}
	const glitchDay = ()=>{
		const dayArr = currentTextRef.current.split("")
		let i = 0;
		const textChange = setInterval(()=>{
			for(let char = 0; char < dayArr.length; char++){
				if(char < i){
					dayArr[char] = currentTextRef.current.charAt(char)
				} else {
					dayArr[char] = String.fromCharCode(Math.floor(Math.random() * (130-65) + 65))
				}
				dayRef.current.innerText = dayArr.join("")
			}
			if ( i >  dayArr.length){
				clearInterval(textChange)
			}
			i++
		}, 40)
	}

	const clearSchedule = async () => {
		const token = localStorage.getItem("token");
		let response = await fetch(`http://localhost:3000/schedules/${scheduleID}`, {
			method: "DELETE",
			headers: {
				"Content-type": "application/json",
				auth: token
			}
		})
		let resp = await response.json();
		if(!response.ok){
			alert(resp.message)
		}
		location.reload()
	}

	const notifyEvent = async (eventID) => {
		const token = localStorage.getItem("token");
		let response = await fetch(`http://localhost:3000/events/notify?id=${eventID}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				auth: token
			}
		})
		let resp = await response.json();
		if(response.ok){
			console.log(resp)
		} else {
			alert(resp.message)
		}
	}
	const handleClickScroll = ()=>{
		const height = scrollRef.current.offsetHeight
		scrollRef.current.scrollTop += height
		if(scrollRef.current.scrollTop >= height * 9 -10) {
			scrollRef.current.scrollTop = 0
		}
	}

	return (
		<>
		{
			privateRef.current &&
			<div className="absolute backdrop-blur-sm z-40 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
				<div className="bg-red-500 text-white rounded-xl w-1/4 h-1/5 font-bold text-2xl flex items-center justify-center">
					Schedule is private!
				</div>
			</div>
		}
		<div style={{backgroundImage: `url("https://res.allmacwallpaper.com/get/Retina-MacBook-Air-13-inch-wallpapers/lava-abstract-formation-8k-2560x1600/23136-11.jpg")`}} className="bg-cover grid grid-rows-[9%_91%] w-full h-full ">
			{authRef.current  && <Header/>}
			{!authRef.current &&
				<div className="bg-slate-950 flex text-white justify-between">
					<div className="w-1/6 text-3xl font-bold font-mono flex items-center pl-4 tracking-wide">
						Calendar+
					</div>
					{topNews.length > 0 &&
						<div ref={scrollRef} className="w-3/5 bg-slate-800 transition-all flex flex-wrap no-scrollbar overflow-auto hover:cursor-pointer scroll-smooth " /*onClick={handleClickScroll}*/>
							{ topNews.map((news, index)=>{
								const title = news.title.slice(0, 60) === news.title ? news.title : news.title.slice(0, 60) + "..."
								return (
									<div key={news.title} className="h-full w-full flex" onClick={()=>window.location.href = (news.url)}>
										<div className="w-[12%] h-full  flex items-center justify-center text-3xl font-semibold bg-slate-900">
											{news.author.split(' ')[0]}
										</div>
										<div className=" w-3/4 h-full  text-2xl font-semibold pl-4 pr-4 p-2 flex items-center">
											{title}
										</div>
										<div className="w-[13%] h-full  flex items-center justify-center text-2xl font-semibold bg-slate-900">

										</div>
									</div>
								)
							}) }
						</div>
					}
					<div className="w-[15%] h-full flex items-center justify-center text-2xl font-bold">
						<Link to="/Signin">Login</Link>
					</div>
				</div>
			}
		<div className="w-full h-full  grid grid-cols-[60%_40%]">
			<div className="bg-zinc-900 bg-opacity-70 m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">
				{
					availableTimes.length > 0 &&
					availableTimes.map((timeBlock, index)=>{
						if(availableTimes.length > 1 && events && events[index]){
							return (
								<>
								<div key={timeBlock[0]} style={{height: getDayPercent(timeBlock) + "%"}} className="w-full flex">
									<div className=" w-1/6 flex-col justify-end flex">
										{/*<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">{intTimeToString(timeBlock[0])}</div>*/}
										<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">
											{intTimeToString(timeBlock[1])}
										</div>
									</div>
									<div>
									</div>
								</div>
								<EventDisplay key={events[index].id} event={events[index]}/>
								</>
							)
						} else {
							return (
								<div key={timeBlock[0]} style={{height: getDayPercent(timeBlock) + "%"}} className="w-full h-1/3 mb-2 flex">
									<div className=" w-1/6 flex-col justify-between flex">
										<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">{intTimeToString(timeBlock[0])}</div>
										<div className="w-full h-auto pr-3 border-b-2 flex items-center justify-end text-white text-xl opacity-70">{intTimeToString(timeBlock[1])}</div>
									</div>
									<div>

									</div>
								</div>
							)
						}
					})
				}
			</div>
			{/*<div className="bg-white m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">*/}
			{/*	{*/}
			{/*		events.map((event)=>{*/}
			{/*			return (*/}
			{/*				<div key={event.id} className="bg-zinc-200 p-4 border-white border-2 hover:h-1/5 hover:bg-zinc-300 transition-all w-full h-1/6 flex items-center justify-center text-2xl font-bold">*/}
			{/*					{event.start} - {event.end} : {event.title}*/}
			{/*					{authRef.current && <button className="font-light bg-red-300 rounded-md ml-4 p-2" onClick={()=>{*/}
			{/*						notifyEvent(event.id)*/}
			{/*					}}>Notify me</button>}*/}
			{/*				</div>*/}
			{/*			)*/}
			{/*		})*/}
			{/*	}*/}
			{/*</div>*/}

			<div className="m-12 overflow-y-auto scrollbar pr-4">
				<div className=" h-1/4 w-full mb-8 grid grid-rows-[62%_38%]">
					<div ref={dayRef} onMouseEnter={glitchDay} className=" text-white text-7xl font-bold font-mono pl-4 w-2/3 pb-4 flex items-end">
						Wednesday
					</div>
					{schedule &&
						<div className=" text-4xl font-semibold font-mono pl-4 text-white">
							{schedule.getDate()}<sup>{getSuffix(schedule.getDate())}</sup> {monthArray[schedule.getMonth()]} {schedule.getFullYear()}
						</div>
					}
				</div>
				{// TODO: Use the get available times function and the events array to stitch together a timeline
					presets.map((preset)=>{
						return(
						<div key={preset.id} onClick={()=>{
							if(selectedPreset === preset.id) {
								setSelectedPreset(null);
							} else {
								setSelectedPreset(preset.id);
							}
						}} className="bg-blue-400 hover:cursor-pointer transition-all w-full h-auto  text-xl font-semibold mb-3 rounded-xl drop-shadow-sm hover:drop-shadow-xl ">
							<div className="p-4">
								{preset.title}
								{authRef.current && <button className="bg-white p-1 hover:bg-zinc-300 rounded-md ml-12" onClick={(e) => {
									e.stopPropagation();
									deletePreset(preset.id)
								}}>Delete</button>}
							</div>
							{selectedPreset === preset.id && <PresetForm preset={preset} scheduleID={scheduleID}/>}
						</div>
					)
					})
				}
				<form className="bg-red-500 bg-opacity-60 w-full h-4/5 rounded-xl p-2 grid grid-rows-[15%_15%_30%_7.5%_7.5%_10%] gap-4">
					<input ref={emailRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="email" placeholder="Enter email" />
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input ref={descriptionRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input ref={startRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter start time" />
					<input ref={endRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter end time" />
					<button type="submit" className="bg-white rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
						submitForm()
					}}>Submit</button>
				</form>
				<button className="w-full h-[10%] bg-white font-bold text-2xl rounded-sm mt-4" onClick={()=>{
					getAvailableTimes();
				}}>Make available time request</button>
				{authRef.current && <button className="w-full h-[10%] bg-red-400 font-bold text-2xl rounded-sm mt-4" onClick={() => {
					clearSchedule();
				}}>Clear Schedule</button>}
			</div>
		</div>
		</div>
	</>
	)
}