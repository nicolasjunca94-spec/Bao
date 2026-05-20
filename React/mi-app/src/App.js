import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./Style/App.css";
import "./Style/Avatar.css";

function App() {
  const [user, setUser] = useState(null);

  // Leer usuario guardado al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario_nombre"); // Ajustado al item que guarda tu Login.js

    if (storedUser) {
      // Como guardamos un string directo (nombre), no requiere JSON.parse
      setUser(storedUser);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <BrowserRouter>
      {/* Navbar solo si hay sesión activa */}
      {isAuthenticated && <Navbar setUser={setUser} />}

      <div className="container">
        <Routes>
          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Login setUser={setUser} />
            }
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Register />
            }
          />

          {/* HOME PROTEGIDA (Cambiado a minúscula para sincronizar con tu Login.js) */}
          <Route
            path="/home"
            element={
              isAuthenticated ? <Home user={user} /> : <Navigate to="/login" />
            }
          />

          {/* RUTA RAÍZ: Si entran a "/" y están logueados van a /home, si no a /login */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;