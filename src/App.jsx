import './App.css'
import {createBrowserRouter, createRoutesFromElements, Route, Router, RouterProvider} from "react-router-dom";
import {Home} from "./pages/Home.jsx";
import {Signup} from "./pages/Signup.jsx";
import {Signin} from "./pages/Signin.jsx";
import {Schedules} from "./pages/Schedules.jsx";


const router = createBrowserRouter(
    createRoutesFromElements(
        <>
          <Route path="/" element={<Home />}/>
          <Route path="/Signin" element={<Signin />}/>
          <Route path="/Signup" element={<Signup />}/>
          <Route path="/Schedules" element={<Schedules />}/>
        </>
    )
)
function App() {

  return (
      <RouterProvider router={router}/>
  )
}

export default App
