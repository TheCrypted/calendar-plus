import {useEffect} from "react";

export const UserDay = () => {
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const scheduleID = searchParams.get("schedule");


	}, [])
	return (
		<div className="w-full h-full bg-zinc-800 grid grid-cols-[60%_40%]">
			<div className="bg-white m-12 rounded-xl drop-shadow-xl hover:drop-shadow-2xl transition-all">
				<div className="bg-zinc-200 w-full h-1/6 rounded-xl flex items-center justify-center text-2xl font-bold">
					1200 - 1700 : Meeting with arnav
				</div>
			</div>
		</div>
	)
}