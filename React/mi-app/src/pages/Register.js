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
      // URL directa quemada sin variables de entorno
      const response = await fetch(
        "https://function-bao-ccb0avh5f0dnaka0.centralus-01.azurewebsites.net/api/personas",
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
            {/* Menú desplegable idéntico al del Login */}
            <select
              name="tipo_identificacion"
              value={form.tipo_identificacion}
              onChange={handleChange}
              required
            >
              <option value="">Tipo Identificación</option>
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="TI">Tarjeta de Identidad (TI)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
            </select>

            <input
              type="text"
              name="numero_identificacion"
              placeholder="Número Identificación"
              value={form.numero_identificacion}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="nombre_completo"
              placeholder="Nombre completo"
              value={form.nombre_completo}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="correo_electronico"
              placeholder="Correo electrónico"
              value={form.correo_electronico}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
            />

            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
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