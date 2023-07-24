import {useState} from "react";
import {useNavigate} from "react-router-dom";

export const Dropdown = () => {
	const [drop, setDrop] = useState(false)
	const navigate = useNavigate()
	const signOut = () =>{
		localStorage.removeItem("token")
		location.reload()
	}
	// TODO: Do something with the schedules button
	return (
		<div className="h-full w-full flex items-center p-3 text-2xl font-semibold justify-center hover:cursor-pointer" onMouseEnter={()=>setDrop(true)} onMouseLeave={()=>setDrop(false)}>
			My Profile
			{drop && <div className="bg-slate-800 absolute z-10 right-0 w-[15%] h-1/5 top-[9%] grid grid-rows-3 rounded-bl-md">
				<div className="flex items-center p-3 text-2xl font-semibold hover:bg-slate-900">Schedules</div>
				<div className="flex items-center p-3 text-2xl font-semibold hover:bg-slate-900" onClick={()=>navigate("/")}>Home</div>
				<div className="flex items-center p-3 text-2xl font-semibold hover:bg-slate-900 rounded-bl-md" onClick={signOut}>Sign out</div>
			</div>}
		</div>
	)
}