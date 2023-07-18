import './App.css'
import {createBrowserRouter, createRoutesFromElements, Route, Router, RouterProvider} from "react-router-dom";
import {Home} from "./pages/Home.jsx";
import {Signup} from "./pages/auth/Signup.jsx";
import {Signin} from "./pages/auth/Signin.jsx";
import {Schedules} from "./pages/Schedules.jsx";
import {UserDay} from "./pages/UserDay.jsx";
import {NotFound} from "./pages/error/NotFound.jsx";
import {SetPreset} from "./pages/SetPreset.jsx";


const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />}/>
            <Route path="/Signin" element={<Signin />}/>
            <Route path="/Signup" element={<Signup />}/>
            <Route path="/Schedules" element={<Schedules />}/>
            <Route path="/Day/:schedule" element={<UserDay />}/>
            <Route path="/Presets" element={<SetPreset />}/>
            <Route path="/:anything" element={<NotFound />} />
        </>
    )
)
function App() {

  return (
      <RouterProvider router={router}/>
  )
}

export default App
