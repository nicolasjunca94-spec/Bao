import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./Style/App.css";
import "./Style/Avatar.css";

function App() {

const [user,setUser] = useState(null);

// leer usuario guardado
useEffect(()=>{

const storedUser = localStorage.getItem("user");

if(storedUser){
setUser(JSON.parse(storedUser));
}

},[]);

const isAuthenticated = !!user;

return(

<BrowserRouter>

{/* Navbar solo si hay sesión */}
{isAuthenticated && <Navbar setUser={setUser}/>}

<div className="container">

<Routes>

{/* LOGIN */}

<Route
path="/login"
element={
isAuthenticated
? <Navigate to="/" />
: <Login setUser={setUser}/>
}
/>

{/* REGISTER */}

<Route
path="/register"
element={
isAuthenticated
? <Navigate to="/" />
: <Register/>
}
/>

{/* HOME PROTEGIDA */}

<Route
path="/"
element={
isAuthenticated
? <Home user={user}/>
: <Navigate to="/login"/>
}
/>

</Routes>

</div>

</BrowserRouter>

);

}

export default App;