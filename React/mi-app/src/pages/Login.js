import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://function-bao-ccb0avh5f0dnaka0.centralus-01.azurewebsites.net/api/login", // ...
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tipo_identificacion: tipo,
            numero_identificacion: numero
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.usuario));
        setUser(data.usuario);
        navigate("/");
      } else {
        setMensaje(data.mensaje);
      }
    } catch (error) {
      setMensaje("Error al conectar con el servidor");
    }
  };

  return (
    <div className="bao-auth-container">
      <div className="bao-auth-card">
        <div className="bao-logo">
          <h1>🐼 BAO</h1>
          <p>Tu asistente emocional universitario</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="bao-input-group">
            <label>Tipo de Documento</label>
            <input
              type="text"
              placeholder="Ej: CC, TI, CE"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              required
            />
          </div>

          <div className="bao-input-group">
            <label>Número de Documento</label>
            <input
              type="text"
              placeholder="Ingresa tu número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>

          <button className="bao-btn">Ingresar a BAO</button>
        </form>

        {mensaje && <div className="bao-error">{mensaje}</div>}

        <div className="bao-auth-footer">
          <p>
            ¿No tienes cuenta?
            <span onClick={() => navigate("/register")}> Crear una cuenta</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
