import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

export const SetPreset = () => {
	// Preset Form
	const titleRef = useRef()
	const descriptionRef = useRef()
	const durationRef = useRef()
	// Config form
	const breakRef = useRef()
	const intervalRef = useRef()
	const preferenceRef = useRef()
	const privateRef = useRef()
	// Bulk event form
	const emailRef = useRef(null);
	const titleEventRef = useRef(null);
	const descriptionEventRef = useRef(null);
	const startRef = useRef(null);
	const endRef = useRef(null);

	const [user, setUser] = useState(null);
	const [schedules, setSchedules] = useState([]);
	const startIndex = useRef(0)
	const endIndex = useRef(0)
	const navigate = useNavigate()
	const token = localStorage.getItem('token')
	if(!token) {
		navigate("/Signin")
	}
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		startIndex.current = parseInt(searchParams.get("s"));
		endIndex.current = parseInt(searchParams.get("e"));
		async function getSchedules(){
			let response = await fetch("http://localhost:3000/schedules/all", {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					auth: token
				}
			})
			let resp = await response.json();
			if(response.ok){
				setSchedules(resp.userSchedules.splice(startIndex.current, endIndex.current))
			} else {
				alert(resp.message)
				navigate("/Signin")
			}
		}
		async function getUser() {
			let response = await fetch("http://localhost:3000/auth/protected", {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					auth: token
				}
			})
			let resp = await response.json()
			if(!response.ok) {
				navigate("/Signin")
			} else {
				setUser(resp.user)
			}}
		getUser()
		getSchedules()
	}, [])
	const createNewPresets = async ()=>{
		let response = await fetch("http://localhost:3000/schedules/setpresets", {
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
				auth: token
			}, body: JSON.stringify({
				startIndex: startIndex.current,
				endIndex: endIndex.current,
				preset: {
					userID: user.id,
					title: titleRef.current.value,
					description: descriptionRef.current.value,
					duration: parseInt(durationRef.current.value)
				}
			})
		})
		if(response.ok) {
			console.log("Success")
		} else {
			console.log("Failure")
		}
	}

	const updateConfig = async ()=>{
		const breakDuration = breakRef.current.value.split("-")[1]
		const config = {
			isPrivate: Boolean(privateRef.current.value),
			preferredStart: preferenceRef.current.value.split("-")[0],
			preferredEnd: preferenceRef.current.value.split("-")[1],
			breakStart: breakRef.current.value.split("-")[0],
			breakDuration: parseInt(breakDuration.split(":")[0]) - (parseInt(breakDuration.split(":")[1])/60),
			minimumInterval: parseFloat(intervalRef.current.value)
		}
		let response = await fetch("http://localhost:3000/config/update", {
			method: 'PUT',
			headers: {
				"Content-Type": "application/json",
				auth: token
			}, body: JSON.stringify({
				config,
				scheduleStart: startIndex.current,
				scheduleEnd: endIndex.current
			})
		})
		const resp = await response.json();
		if(response.ok){
			console.log(resp.userSchedules)
		} else {
			console.log(resp.message)
		}
	}

	const bulkCreateEvent = async () => {
		const token = localStorage.getItem("token")
		const event = {
			clientEmail: emailRef.current.value,
			userModelId: "",
			title: titleEventRef.current.value,
			description: descriptionEventRef.current.value,
			scheduleModelId: "",
			start: startRef.current.value,
			end: endRef.current.value
		}
		let response = await fetch(`http://localhost:3000/events/multiple?start=${startIndex.current}&end=${endIndex.current}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				auth: token
			},
			body: JSON.stringify({event})
		})
		const resp = await response.json()
		if(response.ok){
			console.log(resp)
		} else {
			alert(resp.message)
		}
	}

	return (
		<div className="w-full h-full bg-zinc-800 grid grid-cols-[40%_60%]">
			<div className="bg-white m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">
				{
					schedules.map((schedule)=>{
						return (
							<div className="bg-zinc-200 p-4 border-white border-2 hover:h-1/5 hover:bg-zinc-300 transition-all hover:cursor-pointer w-full h-1/6 flex items-center justify-center text-2xl font-bold" key={schedule.id}>
								{schedule.day.split("T")[0]}
							</div>
						)
					})
				}
			</div>
			<div className="m-12 overflow-y-auto no-scrollbar">
				<form className="bg-red-500 text-white text-2xl font-semibold bg-opacity-60 w-full h-3/5 rounded-xl overflow-y-auto scrollbar p-2 grid grid-rows-[10%_17.5%_32.5%_17.5%_17.5%] gap-4 mb-12">
					Create preset
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input ref={descriptionRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input ref={durationRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter duration"/>
					<button type="submit" className="bg-white text-black rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
						createNewPresets()
					}}>Submit</button>
				</form>
				<form className="mb-12 bg-red-500 text-white text-2xl font-semibold bg-opacity-60 w-full h-3/5 rounded-xl overflow-y-auto scrollbar p-2 grid grid-rows-[10%_17.5%_17.5%_17.5%_17.5%_17.5%] gap-4">
					Change config
					<input ref={breakRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Lunch time (HH:MM-Duration(HH:MM))" />
					<input ref={intervalRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Minimum interval time (Decimal)" />
					<input ref={preferenceRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Preferred meeting period (HH:MM-HH:MM)" />
					<input ref={privateRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Private schedule"/>
					<button type="submit" className="bg-white text-black rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
						updateConfig()
					}}>Submit</button>
				</form>
				<form className="bg-red-500 text-white text-2xl font-semibold bg-opacity-60 w-full h-3/5 rounded-xl overflow-y-auto scrollbar p-2 grid grid-rows-[10%_17.5%_17.5%_17.5%_17.5%_17.5%_17.5%] gap-4">
					Bulk create event
					<input ref={emailRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter email" />
					<input ref={titleEventRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input ref={descriptionEventRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input ref={startRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Start time"/>
					<input ref={endRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="duration"/>
					<button type="submit" className="bg-white text-black rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
						bulkCreateEvent()
					}}>Submit</button>
				</form>
			</div>
		</div>
	)
}