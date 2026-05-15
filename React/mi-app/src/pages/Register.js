import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    tipo_identificacion: "",
    numero_identificacion: "",
    nombre_completo: "",
    correo_electronico: "",
    telefono: "",
    fecha_nacimiento: "",
  });

  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/personas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje("Usuario registrado correctamente 🐼");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMensaje(data.error || "Error al registrar usuario");
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div className="bao-auth-container">
      <div className="bao-auth-card register">
        <div className="bao-logo">
          <h1>🐼 Crear cuenta BAO</h1>
          <p>Empieza tu acompañamiento emocional</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bao-grid">
            <input
              type="text"
              name="tipo_identificacion"
              placeholder="Tipo Identificación"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="numero_identificacion"
              placeholder="Número Identificación"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="correo_electronico"
              placeholder="Correo electrónico"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              onChange={handleChange}
            />

            <input
              type="date"
              name="fecha_nacimiento"
              onChange={handleChange}
            />
          </div>

          <button className="bao-btn">Registrarme en BAO</button>
        </form>

        {mensaje && <div className="bao-success">{mensaje}</div>}

        <div className="bao-auth-footer">
          <p>
            ¿Ya tienes cuenta?
            <span onClick={() => navigate("/login")}> Iniciar sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
