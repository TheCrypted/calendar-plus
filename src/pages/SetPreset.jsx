import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {DataTypes} from "sequelize";
import User from "../../models/userModel.cjs";

export const SetPreset = () => {
	const titleRef = useRef(null)
	const descriptionRef = useRef(null)
	const durationRef = useRef(null)
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
					duration: durationRef.current.value
				}
			})
		})
		if(response.ok) {
			console.log("Success")
		} else {
			console.log("Failure")
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
			<div className="m-12 overflow-y-auto scrollbar">
				<form className="bg-red-500 bg-opacity-60 w-full h-3/5 rounded-xl p-2 grid grid-rows-[17.5%_32.5%_17.5%_17.5%] gap-4 mb-12">
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input ref={titleRef} className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter duration"/>
					<button type="submit" className="bg-white rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
					}}>Submit</button>
				</form>
				<form className="bg-red-500 bg-opacity-60 w-full h-3/5 rounded-xl p-2 grid grid-rows-[17.5%_17.5%_17.5%_17.5%_17.5%] gap-4">
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Lunch time" />
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Minimum break time" />
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Preferred meeting period" />
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Private schedule"/>
					<button type="submit" className="bg-white rounded-md drop-shadow-md hover:drop-shadow-2xl w-full h-full text-2xl font-bold" onClick={(e)=>{
						e.preventDefault();
					}}>Submit</button>
				</form>
			</div>
		</div>
	)
}