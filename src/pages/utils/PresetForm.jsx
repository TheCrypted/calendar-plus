import {useRef} from "react";

export const PresetForm = ({preset, scheduleID}) => {
	const emailRef = useRef();
	const addRef = useRef();
	const timeRef = useRef();

	return (
		<form className="flex justify-center flex-wrap w-full bg-zinc-600 rounded-b-xl p-3" onClick={(e)=>{
			e.stopPropagation()
		}
		}>
			<input ref={emailRef} className="focus:outline-none bg-zinc-800 text-white pl-2 w-full mb-2 mt-3 p-2 font-semibold rounded-md" placeholder="Enter email" type="text" />
			<input ref={addRef} className="focus:outline-none bg-zinc-800 text-white pl-2 w-full mb-2 p-2 font-semibold rounded-md" placeholder="Any additional information" type="text" />
			<input ref={timeRef} className="focus:outline-none bg-zinc-800 text-white pl-2 w-full mb-2 p-2 font-semibold rounded-md" type="time" />
			<button type="submit" className="bg-white p-2 w-1/2 rounded-md" onClick={async (e) => {
				e.preventDefault()
				let description = addRef.current.value === "" ? preset.description : addRef.current.value
				const event = {
					clientEmail: emailRef.current.value,
					userModelId: preset.userID,
					title: preset.title,
					description: description,
					scheduleModelId: scheduleID,
					start: timeRef.current.value,
					end: preset.duration.toString()
				}
				let response = await fetch(`http://localhost:3000/events/newevents`, {
					method: "POST",
					headers: {
						"Content-type": "application/json"
					}, body: JSON.stringify({
						event
					})
				})
				let resp = await response.json();
				if(!response.ok){
					alert(resp.message)
				} else {
					location.reload()
				}
			}}>Submit</button>
		</form>
	)
}