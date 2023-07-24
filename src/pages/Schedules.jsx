import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Header} from "./components/Header.jsx";
import {getSuffix} from "./utils/timeMath.js";
import {DateComp} from "./components/DateComp.jsx";

export const Schedules = () => {
	const [user, setUser] = useState(null)
	const [schedules, setSchedules] = useState(null)
	const configRef = useRef([])
	const selectorRef = useRef(false)
	const [selecting, setSelecting] = useState(false)
	const numberScheduleRef = useRef(0)
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
			console.log(resp)
			setSchedules((existingSchedules) => [...existingSchedules, ...resp.createdSchedules])
		} else {
			alert(resp.message)
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
			alert(resp.message)
		}
	}
	return (
		<div style={{backgroundImage: `url("https://res.allmacwallpaper.com/get/Retina-MacBook-Air-13-inch-wallpapers/lava-abstract-formation-8k-2560x1600/23136-11.jpg")`}} className="bg-cover bg-black w-full h-full text-white bg-cover grid grid-rows-[9%_5%_86%]">
			<Header />
			<div className="bg-black text-black flex gap-4 w-full">
				<button className="bg-white text-black w-1/4 h-full font-bold" onClick={async (e)=>{
					setSelected(new Array(schedules.length).fill(false))
					selectorRef.current = !selectorRef.current
					setSelecting((prev)=>!prev)
					e.target.innerText = "Selecting " + selectorRef.current
				}}>Selecting false</button>
				<button className="bg-white text-black w-1/4 h-full font-bold" onClick={()=>{
					let firstTrueIndex = selected.indexOf(true)
					let lastTrueIndex = selected.lastIndexOf(true)
					navigate(`/Presets?s=${firstTrueIndex}&e=${lastTrueIndex}`)
				}}>
					Set Preset for Selection
				</button>
			</div>
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
												const bgColor = selected[index] ? "bg-purple-900 bg-opacity-70" : "bg-zinc-900 bg-opacity-50"
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

					{
						// old barely functional stuff
					schedules.map((schedule, index) => {
						let bgColor = "bg-white"
						if(selected[index]) {
							bgColor = "bg-blue-300";
						}
						return (
							<div key={schedule.id} onClick={()=>{
								if(!selectorRef.current) {
									navigate(`/Day/${user.name}?schedule=${schedule.id}&owner=${user.id}`)
								} else {
									handleSelect(index)
								}
							}} className={"hover:cursor-pointer " + bgColor + " transition-all hover:drop-shadow-xl text-black justify-center text-2xl font-bold bg-white rounded-md flex items-center  w-1/6 h-1/6"}>{schedule.day.split("T")[0]}</div>
						)
					})
				}
				<div className="w-full h-1/6 flex items-center justify-center mt-4 mb-4">
					<form className=" flex items-center justify-center bg-blue-500 rounded-xl h-5/6 p-4 w-1/3 drop-shadow-md hover:drop-shadow-xl transition-all border-4 text-2xl  font-semibold border-white">
						Create
						<input className="text-white hide-spin-buttons focus:outline-none p-2 ml-3 mr-3 w-1/5  rounded-md bg-blue-700 text-white" placeholder="0" type="number" ref={numberScheduleRef} />
						Schedules
						<button type="submit" onClick={(e)=> {
							e.preventDefault();
							createNewSchedules()
						}} className=" ml-4 text-blue-500 bg-white h-4/5 w-[10%] rounded-md hover:drop-shadow-xl transition-all flex justify-center items-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
							</svg>
						</button>
					</form>
					<button onClick={toggleWeekend} className="bg-red-400 ml-4 h-5/6 w-1/6 border-4 border-white rounded-xl hover:drop-shadow-xl transition-all text-2xl  font-semibold">
						Toggle weekend
					</button>
				</div>
			</div>}
		</div>
	)
}