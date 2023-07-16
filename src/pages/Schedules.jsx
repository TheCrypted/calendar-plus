import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export const Schedules = () => {
	const [user, setUser] = useState(null)
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
			console.log(resp)
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

	const [schedules, setSchedules] = useState(null)

	return (
		<div className="bg-black w-full h-full text-white">
			<button className="bg-white text-black w-1/4 h-1/5" onClick={async ()=>{
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
			}}>Click me</button>
			{schedules && <div className="w-full bg-zinc-300 scrollbar flex justify-center p-4 gap-4 overflow-y-auto h-4/5 flex-wrap">
				{
					schedules.map((schedule) => {
						return (
							<div key={schedule.id} onClick={()=>{
								navigate(`/Day/${user.name}?schedule=${schedule.id}`)
							}
							} className="hover:cursor-pointer transition-all hover:drop-shadow-xl text-black justify-center text-2xl font-bold bg-white rounded-md flex items-center  w-1/6 h-1/6">{schedule.day.split("T")[0]}</div>
						)
					})
				}
			</div>}
		</div>
	)
}