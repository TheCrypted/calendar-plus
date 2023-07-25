import {useRef} from "react";

export const WeekendToggle = () => {
	const toggleRef = useRef(null)
	const toggleButton = ()=>{
		toggleRef.current.classList.toggle("left-[37%]")
		toggleRef.current.classList.toggle("left-[57.5%]")
	}
	const toggleWeekend = async(e)=>{
		e.preventDefault()
		const token = localStorage.getItem("token")
		let response = await fetch("http://localhost:3000/schedules/weekends", {
			method: "PUT",
			headers: {
				"Content-type": "application/json",
				makePrivate: toggleRef.current.classList.contains("left-[37%]").toString(),
				auth: token
			}
		})
		let resp = await response.json()
		if(!response.ok){
			console.log(resp.message)
		}
		location.reload()
	}

	return (
		<form className="bg-zinc-800 bg-opacity-40  h-full w-full flex items-center justify-center border-white rounded-r-xl drop-shadow-xl transition-all text-xl  font-semibold">
			Weekends: &nbsp; &nbsp;
			<div className="flex bg-zinc-900 bg-opacity-50 h-1/2 w-2/5 rounded-md">
				<div className="w-full h-full rounded-l-md flex items-center justify-center xl:text-xl text-sm font-bold text-white">Public</div>
				<div className="w-full h-full rounded-r-md flex items-center justify-center xl:text-xl text-sm font-bold text-white">Private</div>
				<div onClick={toggleButton} ref={toggleRef} className="absolute left-[57.5%] w-1/5 hover:bg-zinc-600 rounded-md h-1/2 bg-zinc-500 transition-all"></div>
			</div>
			<button type='submit' onClick={toggleWeekend} className="w-[10%] flex items-center justify-center h-1/3 bg-white bg-opacity-20 hover:bg-opacity-40 ml-3 rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
				</svg>
			</button>
		</form>
	)
}