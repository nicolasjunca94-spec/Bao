import { useNavigate } from "react-router-dom";

function Navbar({ setUser }) {

const navigate = useNavigate();

const cerrarSesion = () => {

localStorage.removeItem("user");

setUser(null);

navigate("/login");

};

return (

<nav className="navbar-bao">

<div className="navbar-logo">
🐼 BAO
</div>

<div className="navbar-links">

<button
className="logout-btn"
onClick={cerrarSesion}
>

Cerrar sesión

</button>

</div>

</nav>

);

}

export default Navbar;