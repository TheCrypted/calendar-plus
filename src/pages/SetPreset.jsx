export const SetPreset = () => {
	return (
		<div className="w-full h-full bg-zinc-800 grid grid-cols-[40%_60%]">
			<div className="bg-white m-12 rounded-xl overflow-y-auto scrollbar drop-shadow-xl hover:drop-shadow-2xl transition-all ">

			</div>
			<div className="m-12 overflow-y-auto scrollbar">
				<form className="bg-red-500 bg-opacity-60 w-full h-3/5 rounded-xl p-2 grid grid-rows-[17.5%_32.5%_17.5%_17.5%] gap-4 mb-12">
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter title" />
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter description" />
					<input className="transition bg-zinc-800 drop-shadow-md focus:drop-shadow-2xl w-full h-full rounded-md focus:outline-none p-2 text-white text-xl font-semibold" type="text" placeholder="Enter duration"/>
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