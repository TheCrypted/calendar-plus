import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

export const Schedules = () => {
	const [user, setUser] = useState(null)
	const [schedules, setSchedules] = useState(null)
	const selectorRef = useRef(false)
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
			let response = await fetch(`http://localhost:3000/schedules/${user.id}`, {
				method: "GET",
				headers: {
					"content-type": "application/json"
				}
			})
			let resp = await response.json()
			if(response.ok) {
				setSchedules(resp.userSchedules)

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
			let newSelected = [new Array(schedules.length).fill(false)]
			for(let i = lower; i < higher+1; i++){
				newSelected[i] = true
			}
			setSelected(newSelected)
		} else {
			let newSelected = [new Array(schedules.length).fill(false)]
			newSelected[index] = true
			setSelected(newSelected)
		}
		currentlySelecting.current = currentlySelecting.current ? null : index
	}

	return (
		<div className="bg-black w-full h-full text-white">
			<button className="bg-white text-black w-1/4 h-1/5" onClick={async (e)=>{
				selectorRef.current = !selectorRef.current
				e.target.innerText = "Selecting " + selectorRef.current
			}}>Selecting false</button>
			{schedules && <div className="w-full bg-zinc-300 scrollbar flex justify-center p-4 gap-4 overflow-y-auto h-4/5 flex-wrap">
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
			</div>}
		</div>
	)
}