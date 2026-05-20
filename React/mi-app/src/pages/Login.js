import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({
    tipo_identificacion: "",
    numero_identificacion: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [esExito, setEsExito] = useState(true);
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
      // URL directa quemada en el código sin usar variables de entorno
      const url = "https://function-bao-ccb0avh5f0dnaka0.centralus-01.azurewebsites.net/api/login";
      console.log("Iniciando sesión en:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setEsExito(true);
        setMensaje(`¡Bienvenido de vuelta, ${data.usuario || "Estudiante"}! 🐼`);
        
        if (data.usuario) {
          localStorage.setItem("usuario_nombre", data.usuario);
        }

        setTimeout(() => navigate("/home"), 1500);
      } else {
        setEsExito(false);
        setMensaje(data.error || "Credenciales incorrectas. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      setEsExito(false);
      setMensaje("Error al conectar con el servidor de autenticación");
    }
  };

  return (
    <div className="bao-auth-container">
      <div className="bao-auth-card login">
        <div className="bao-logo">
          <h1>🐼 Ingresar a BAO</h1>
          <p>Tu espacio de acompañamiento universitario</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bao-form-group">
            <label htmlFor="tipo_identificacion">Tipo de Documento</label>
            <select
              id="tipo_identificacion"
              name="tipo_identificacion"
              value={form.tipo_identificacion}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="TI">Tarjeta de Identity (TI)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
            </select>
          </div>

          <div className="bao-form-group mt-3">
            <label htmlFor="numero_identificacion">Número de Documento</label>
            <input
              id="numero_identificacion"
              type="text"
              name="numero_identificacion"
              placeholder="Ingresa tu número de identificación"
              value={form.numero_identificacion}
              onChange={handleChange}
              required
            />
          </div>

          <button className="bao-btn mt-4">Iniciar Sesión</button>
        </form>

        {mensaje && (
          <div className={esExito ? "bao-success" : "bao-error"}>
            {mensaje}
          </div>
        )}

        <div className="bao-auth-footer">
          <p>
            ¿Eres nuevo por aquí?
            <span onClick={() => navigate("/register")}> Crear una cuenta</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;