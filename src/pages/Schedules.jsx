import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

export const Schedules = () => {
	const [user, setUser] = useState(null)
	const [schedules, setSchedules] = useState(null)
	const configRef = useRef([])
	const selectorRef = useRef(false)
	const numberScheduleRef = useRef(0)
	const navigate = useNavigate()

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
		}
	}, [schedules])
	const [selected, setSelected] = useState([])
	const currentlySelecting = useRef(null)
	const handleSelect = (index) => {
		if(currentlySelecting.current){
			let higher = Math.max(currentlySelecting.current, index)
			let lower = Math.min(currentlySelecting.current, index)
			let newSelected = (new Array(schedules.length).fill(false))
			for(let i = lower; i < higher+1; i++){
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
		<div className="bg-black w-full h-full text-white">
			<div className="bg-black text-black flex gap-4 w-full h-1/5">
				<button className="bg-white text-black w-1/4 h-1/5 font-bold" onClick={async (e)=>{
					setSelected(new Array(schedules.length).fill(false))
					selectorRef.current = !selectorRef.current
					e.target.innerText = "Selecting " + selectorRef.current
				}}>Selecting false</button>
				<button className="bg-white text-black w-1/4 h-1/5 font-bold" onClick={()=>{
					let firstTrueIndex = selected.indexOf(true)
					let lastTrueIndex = selected.lastIndexOf(true)
					navigate(`/Presets?s=${firstTrueIndex}&e=${lastTrueIndex}`)
				}}>
					Set Preset for Selection
				</button>
			</div>
			{schedules &&
				<div className="w-full bg-zinc-300 scrollbar flex justify-center p-4 gap-4 overflow-y-auto h-4/5 flex-wrap">
				{
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