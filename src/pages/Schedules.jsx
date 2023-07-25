import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Header} from "./components/Header.jsx";
import {getSuffix} from "./utils/timeMath.js";
import {DateComp} from "./components/DateComp.jsx";
import {WeekendToggle} from "./components/WeekendToggle.jsx";

export const Schedules = () => {
	const [user, setUser] = useState(null)
	const [schedules, setSchedules] = useState(null)
	const configRef = useRef([])
	const selectorRef = useRef(false)
	const [selecting, setSelecting] = useState(false)
	const numberScheduleRef = useRef(0)
	const newRef = useRef(null)
	const [newOpen, setNewOpen] = useState(false)
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	const daysInEachMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	const navigate = useNavigate()
	const [firstDate, setFirstDate] = useState(new Date())
	const scheduledMonthsRef = useRef([])
	let scheduleIndexRef = useRef(0)

	useEffect(() => {
		async function getUser() {
		const token = localStorage.getItem('token')
		if(!token) {
			navigate("/Signin")
		}
		let response = await fetch("http://localhost:3000/auth/protected", {
			method: 'GET',
			headers: {
				'content-Type': 'application/json',
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
	}, [])
	useEffect(()=>{
		async function getSchedules() {
			let token = localStorage.getItem('token')
			let response = await fetch(`http://localhost:3000/schedules/all`, {
				method: "GET",
				headers: {
					"Content-type": "application/json",
					auth: token
				}
			})
			let resp = await response.json()
			if(response.ok) {
				setSchedules(resp.userSchedules)
				configRef.current = resp.configs
			} else {
				console.log("error getting user schedules")
			}
		}
		if(user) {
			getSchedules()
		}
	}, [user])
	useEffect(()=>{
		if(schedules) {
			setSelected(new Array(schedules.length).fill(false))
			let day = new Date(schedules[0].day)
			setFirstDate(new Date(day.getFullYear(), day.getMonth(), 1))
			let currentMonth = -1;
			if(scheduledMonthsRef.current.length === 0){
				for (let i = 0; i < schedules.length; i++) {
					let date = new Date(schedules[i].day)
					if (date.getMonth() !== currentMonth) {
						scheduledMonthsRef.current.push(date.getMonth())
						currentMonth = date.getMonth()
					}
					if (date.getDate() === 1) {
						i += 20;
					}
				}
			}

		}
	}, [schedules])
	const [selected, setSelected] = useState([])
	const currentlySelecting = useRef(null)
	const handleSelect = (index) => {

		if (currentlySelecting.current) {
			let higher = Math.max(currentlySelecting.current, index)
			let lower = Math.min(currentlySelecting.current, index)
			let newSelected = (new Array(schedules.length).fill(false))
			for (let i = lower; i < higher + 1; i++) {
				newSelected[i] = true
			}
			setSelected(newSelected)
		} else {
			let newSelected = (new Array(schedules.length).fill(false))
			newSelected[index] = true
			setSelected(newSelected)
		}
		currentlySelecting.current = currentlySelecting.current ? null : index

	}

	const createNewSchedules = async()=>{
		const token = localStorage.getItem('token')
		if (numberScheduleRef.current.value > 60) return
		let response = await fetch("http://localhost:3000/schedules/create", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				auth: token
			}, body: JSON.stringify({
				date: new Date(),
				amount: parseInt(numberScheduleRef.current.value)
			})
		})
		let resp = await response.json()
		if(response.ok){
			setSchedules((existingSchedules) => [...existingSchedules, ...resp.createdSchedules])
			configRef.current = [...configRef.current, ...resp.configs]
		} else {
			console.log(resp.message)
		}
	}
	const toggleWeekend = async()=>{
		const token = localStorage.getItem("token")
		let response = await fetch("http://localhost:3000/schedules/weekends", {
			method: "PUT",
			headers: {
				"Content-type": "application/json",
				makePrivate: "true",
				auth: token
			}
		})
		let resp = await response.json()
		if(!response.ok){
			console.log(resp.message)
		}
		location.reload()
	}
	const onNewClick = ()=>{
		newRef.current.classList.toggle("w-20")
		newRef.current.classList.toggle("w-2/3")
		newRef.current.classList.toggle("h-20")
		newRef.current.classList.toggle("h-1/6")
		newRef.current.classList.toggle("rounded-full")
		newRef.current.classList.toggle("rounded-xl")
		newRef.current.classList.toggle("bg-blue-500")
		newRef.current.classList.toggle("bg-zinc-700")
		newRef.current.classList.toggle("bg-opacity-70")
		setNewOpen((prev)=> !prev)

	}

	return (
		<div style={{backgroundImage: `url("https://res.allmacwallpaper.com/get/Retina-MacBook-Air-13-inch-wallpapers/lava-abstract-formation-8k-2560x1600/23136-11.jpg")`}} className="bg-cover bg-black w-full h-full text-white bg-cover grid grid-rows-[9%_91%]">
			<Header />
			{schedules &&
				<div className="w-full scrollbar flex justify-center p-4 gap-4 overflow-y-auto overflow-x-hidden flex-wrap">
					{scheduledMonthsRef.current.length > 0 &&
						scheduledMonthsRef.current.map((month)=>{
							const bgColor = selecting ? "bg-blue-500 opacity-100": "bg-none"
							return (
								<div key={month} className="w-full flex flex-wrap justify-center mb-4 gap-4">
									<div className="w-[88%] pl-4 flex items-center justify-between border-l-2 mb-3 border-white h-16 text-white text-3xl mt-6 font-bold">
										{monthArray[month]}, 2023
										<div className="w-2/5 h-full flex items-center justify-between p-2 text-white text-xl">
											<button className="flex w-auto p-2 h-full items-center pt-2" onClick={async (e)=>{
												setSelected(new Array(schedules.length).fill(false))
												selectorRef.current = !selectorRef.current
												setSelecting((prev)=>!prev)
											}}>
												<svg xmlns="http://www.w3.org/2000/svg" fill={selecting ? "#0384fc" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="mr-3 w-10 h-10">
													<path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>
												</svg>
												Select days
											</button>
											<button onClick={()=>{
												let firstTrueIndex = selected.indexOf(true)
												let lastTrueIndex = selected.lastIndexOf(true)
												navigate(`/Presets?s=${firstTrueIndex}&e=${lastTrueIndex}`)
											}} disabled={!selecting} className={"font-semibold mr-4 p-2 rounded-xl hover:opacity-100 "+ bgColor+" transition-all opacity-50 border-2 border-white"}>
												Modify schedules
											</button>
										</div>
									</div>
									<div className="w-[88%] p-3 z-0 h-auto rounded-2xl drop-shadow-xl bg-zinc-700 bg-opacity-50  grid grid-cols-7 gap-4">
										{
											schedules.map((schedule, index)=>{
												const opacity = configRef.current[index].isPrivate ? " opacity-50 " : " opacity-100 "
												const bgColor = selected[index] ? "bg-purple-900 bg-opacity-70": "bg-zinc-900 bg-opacity-50" + opacity
												const day = new Date(schedule.day)
												if(day.getMonth() === month) {
													return <DateComp selected={bgColor} selectorRef={selecting} handleSelect={handleSelect} index={index} key={schedule.id} user={user} schedule={schedule}/>
												}
											})
										}
									</div>
								</div>
							)
						})
					}
				<div onClick={onNewClick} ref={newRef} className="transition-all w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center drop-shadow-md hover:drop-shadow-xl hover:cursor-pointer mt-8">
					{!newOpen && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-11 h-11">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
					</svg>}
					{
						newOpen &&
						<>
							<div className="w-[10%] bg-zinc-400 bg-opacity-50 h-full flex items-center rounded-l-xl justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
							</svg>
							</div>
						<div className=" w-1/2 h-full" onClick={(e)=>e.stopPropagation()}>
							<form className=" flex items-center justify-center bg-zinc-700 bg-opacity-50  h-full p-4 w-full drop-shadow-md hover:drop-shadow-xl transition-all text-2xl  font-semibold border-white">
								Add
								<input className="text-white hide-spin-buttons focus:outline-none p-2 ml-3 mr-3 w-1/5  rounded-md bg-zinc-900 bg-opacity-50 text-white" placeholder="0" type="number" ref={numberScheduleRef} />
								Days
								<button type="submit" onClick={(e)=> {
									e.preventDefault();
									createNewSchedules()
								}} className=" ml-6 hover:bg-opacity-40 text-white w-[12%] bg-white bg-opacity-20 h-[50%]  rounded-md hover:drop-shadow-xl transition-all flex justify-center items-center">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
									</svg>
								</button>
							</form>
						</div>
						<div className="rounded-r-xl w-[40%] h-full" onClick={(e)=>e.stopPropagation()}>
							<WeekendToggle />
							{/*<button onClick={toggleWeekend} className="bg-zinc-400 bg-opacity-40  h-full w-full border-white rounded-r-xl hover:drop-shadow-xl transition-all text-2xl  font-semibold">*/}
							{/*	Toggle weekend*/}
							{/*</button>*/}
						</div>
						</>
					}
				</div>
			</div>}
		</div>
	)
}