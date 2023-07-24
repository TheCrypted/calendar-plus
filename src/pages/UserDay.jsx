import {useEffect, useRef, useState} from "react";
import {PresetForm} from "./components/PresetForm.jsx";

export const UserDay = () => {
	const [events, setEvents] = useState([])
	const [scheduleOwner, setScheduleOwner] = useState(null)
	const [presets, setPresets] = useState([])
	const [selectedPreset, setSelectedPreset] = useState(null)
	const emailRef = useRef(null);
	const titleRef = useRef(null);
	const descriptionRef = useRef(null);
	const startRef = useRef(null);
	const endRef = useRef(null);
	const searchParams = new URLSearchParams(location.search);
	const scheduleID = searchParams.get("schedule");
	const authRef = useRef(false);
	const privateRef = useRef(false);
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
			} else {
				if(resp.isPrivate){
					privateRef.current = true
				}
				console.log(resp)
			}
		}
		getEvents()
		getPresets()
		verifyAdminAccess()
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
	const getAvailableTimes = async () => {
		let response = await fetch(`http://localhost:3000/schedules/available?schedule=${scheduleID}`, {
			method: "GET",
			headers: {
				"Content-type": "application/json"
			}
		})
		let resp = await response.json();
		if(!response.ok){
			alert(resp.message);
		} else {
			console.log(resp.availableSlots)
		}
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
		<div className="w-full h-full bg-zinc-800 grid grid-cols-[60%_40%]">
			<div className="bg-white m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">
				{
					events.map((event)=>{
						return (
							<div key={event.id} className="bg-zinc-200 p-4 border-white border-2 hover:h-1/5 hover:bg-zinc-300 transition-all w-full h-1/6 flex items-center justify-center text-2xl font-bold">
								{event.start} - {event.end} : {event.title}
								{authRef.current && <button className="font-light bg-red-300 rounded-md ml-4 p-2" onClick={()=>{
									notifyEvent(event.id)
								}}>Notify me</button>}
							</div>
						)
					})
				}
			</div>
			<div className="m-12 overflow-y-auto scrollbar">
				{
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
	</>
	)
}