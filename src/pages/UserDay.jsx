import {useEffect, useRef, useState} from "react";

export const UserDay = () => {
	const [events, setEvents] = useState([])
	const [scheduleOwner, setScheduleOwner] = useState(null)

	const emailRef = useRef(null);
	const titleRef = useRef(null);
	const descriptionRef = useRef(null);
	const startRef = useRef(null);
	const endRef = useRef(null);
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const scheduleID = searchParams.get("schedule");
		setScheduleOwner(searchParams.get("owner"));
		const getEvents = async ()=> {
			let response = await fetch(`http://localhost:3000/events/${scheduleID}`, {
				method: "GET",
				headers: {
					"content-type": "application/json"
				}
			})
			const resp = await response.json()
			if(response.ok){
				setEvents(resp.events)
			} else {
				console.log(resp)
			}
		}
		getEvents()
	}, [])
	const submitForm = async () => {
		const searchParams = new URLSearchParams(location.search);
		const scheduleID = searchParams.get("schedule");
		let response = await fetch("http://localhost:3000/events/newevents", {
			method: "POST",
			headers: {
				"content-type": "application.json"
			},
			body: JSON.stringify({
				event: {
					clientEmail: emailRef.current.value,
					userModelId: scheduleOwner,
					title: titleRef.current.value,
					description: descriptionRef.current.value,
					scheduleModelId: scheduleID,
					start: startRef.current.value,// This is wrong as the DB only accepts Date objects so you gotta convert this to a date somehow
					end: endRef.current.value// This is wrong as the DB only accepts Date objects so you gotta convert this to a date somehow
				}
			})
		})
		let resp = await response.json();
		if(!response.ok){
			alert(resp.message)
		}
	}

	return (
		<div className="w-full h-full bg-zinc-800 grid grid-cols-[60%_40%]">
			<div className="bg-white m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">
				{
					events.map((event)=>{
						return (
							<div key={event.id} className="bg-zinc-200 p-4 border-white border-2 hover:h-1/5 hover:bg-zinc-300 transition-all hover:cursor-pointer w-full h-1/6 flex items-center justify-center text-2xl font-bold">
								{event.start.split(/[T.]/)[1]} - {event.end.split(/[T.]/)[1]} : {event.title}
							</div>
						)
					})
				}
			</div>
			<div className="m-12">
				<form className="bg-red-500 bg-opacity-60 w-full h-4/5 rounded-xl p-2 grid grid-rows-[15%_15%_30%_7.5%_7.5%_10%] gap-4">
					<input ref={emailRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="email" placeholder="Enter email" />
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input ref={descriptionRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input ref={startRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="time" />
					<input ref={endRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="time" />
					<button type="submit" className="bg-white rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold">Submit</button>
				</form>
			</div>
		</div>
	)
}