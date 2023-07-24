import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getSuffix, to12h} from "../utils/timeMath.js";
import {Dropdown} from "./Dropdown.jsx";

export const Header = () => {
	const [user, setUser] = useState(null);
	const [topEvents, setTopEvents] = useState([]);
	const navigate = useNavigate()
	const scrollRef = useRef(null)
	useEffect(()=>{
		const token = localStorage.getItem("token");
		if(!token){
			navigate("/Signin")
		}
		const getUser = async()=>{
			let response = await fetch("http://localhost:3000/auth/protected", {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					auth: token
				}
			})
			const resp = await response.json();
			if(response.ok) {
				setUser(resp.user.name)
			} else {
				navigate("/Signin")
			}
		}
		const getTopEvents = async() =>{
			let response = await fetch("http://localhost:3000/schedules/first/3", {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					auth: token
				}
			})
			const resp = await response.json();
			if(response.ok) {
				setTopEvents(resp.events)
			} else {
				alert(resp.message)
			}
		}
		// setInterval(handleClickScroll, 3000)
		getUser()
		getTopEvents()
	}, [])
	const handleClickScroll = ()=>{
		const height = scrollRef.current.offsetHeight
		scrollRef.current.scrollTop += height
		if(scrollRef.current.scrollTop >= height* 2 -10) {
			scrollRef.current.scrollTop = 0
		}
	}

	return (
		<div className="bg-slate-950 flex">
			<div className="w-1/4 text-3xl font-bold font-mono flex items-center pl-2 tracking-wide">
				{user?.slice(0,10)}'s Calendar+
			</div>
			{topEvents.length > 0 &&
				<div ref={scrollRef} className="w-3/5 bg-slate-800 transition-all flex flex-wrap no-scrollbar overflow-auto hover:cursor-pointer scroll-smooth " /*onClick={handleClickScroll}*/>

					{ topEvents.map((event)=>{
						let date = new Date(event.day)
						return (
							<div key={event.id} className="h-full w-full flex">
								<div className="w-[12%] h-full  flex items-center justify-center text-3xl font-semibold bg-slate-900">
									{date.getDate()}<sup>{getSuffix(date.getDate())}</sup>
								</div>
								<div className=" w-3/4 h-full  text-2xl font-semibold pl-4 flex items-center">
									{event.title}
								</div>
								<div className="w-[13%] h-full  flex items-center justify-center text-2xl font-semibold bg-slate-900">
									{to12h(event.start)}
								</div>
							</div>
						)
					}) }
				</div>
			}
			<div className="w-[15%] h-full">
				<Dropdown />
			</div>
		</div>
	)
}