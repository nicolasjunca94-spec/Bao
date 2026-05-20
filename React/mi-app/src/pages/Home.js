import { useState } from "react";
import BaoAvatar from "../components/BaoAvatar";
import "../Style/navbar.css";

function Home() {
  const [emocionSeleccionada, setEmocionSeleccionada] = useState("");
  const [mensajeUsuario, setMensajeUsuario] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [pensando, setPensando] = useState(false);

  const emociones = [
    { nombre: "Feliz", emoji: "😄" },
    { nombre: "Tranquilo", emoji: "😌" },
    { nombre: "Motivado", emoji: "🚀" },
    { nombre: "Agradecido", emoji: "🙏" },
    { nombre: "Cansado", emoji: "😴" },
    { nombre: "Estresado", emoji: "😰" },
    { nombre: "Ansioso", emoji: "😟" },
    { nombre: "Triste", emoji: "😢" },
    { nombre: "Frustrado", emoji: "😤" },
    { nombre: "Confundido", emoji: "😕" },
    { nombre: "Solitario", emoji: "🥺" },
    { nombre: "Esperanzado", emoji: "🌟" }
  ];

  const enviarMensajeIA = async () => {
    if (!mensajeUsuario.trim()) return;

    // Agregar el mensaje del usuario inmediatamente en la pantalla
    setMensajes(prev => [
      ...prev,
      { tipo: "usuario", texto: mensajeUsuario }
    ]);

    setPensando(true);

    try {
      const url = "https://function-bao-ccb0avh5f0dnaka0.centralus-01.azurewebsites.net/api/chat";

      const opciones = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emocion: emocionSeleccionada,
          mensaje: mensajeUsuario,
          // 🔥 AGREGAMOS ESTA LÍNEA NUEVA:
          historial: mensajes 
        })
      };

      const response = await fetch(url, opciones);

      // ==========================================
      // CONTROL DE ERRORES MEJORADO (DIAGNÓSTICO)
      // ==========================================
      if (!response.ok) {
        // Intentamos leer el JSON de error enviado por el return json_response de Python
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ DETALLE DEL ERROR 500 DESDE AZURE:", errorData);
        
        // Lanzamos el error con el mensaje específico (ej: "GEMINI_API_KEY no configurada")
        throw new Error(`Error en API: ${response.status} - ${errorData.error || 'Excepción interna de Python'}`);
      }

      // Si la respuesta es exitosa (200 OK)
      const data = await response.json();
      console.log("Respuesta procesada de BAO:", data);

      setPensando(false);

      if (data && data.mensaje) {
        setMensajes(prev => [
          ...prev,
          { tipo: "bao", texto: data.mensaje }
        ]);

        if (data.opciones && data.opciones.length > 0) {
          setMensajes(prev => [
            ...prev,
            { tipo: "bao", texto: "💡 Sugerencias de BAO para ti: " + data.opciones.join(", ") }
          ]);
        }
      } else {
        setMensajes(prev => [
          ...prev,
          { tipo: "bao", texto: "Vaya, me costó un poco procesar tu idea. ¿Podrías repetírmela?" }
        ]);
      }

      setMensajeUsuario("");

    } catch (error) {
      setPensando(false);
      console.error("Error llamando IA:", error);
      
      // Pintamos el error en la burbuja del chat para que no tengas que abrir siempre el inspector
      setMensajes(prev => [
        ...prev,
        { tipo: "bao", texto: `🚨 [Error de conexión]: ${error.message}` }
      ]);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Habla con BAO 🐼</h2>

      {/* AVATAR ANIMADO */}
      <BaoAvatar pensando={pensando} />

      {/* SECCIÓN DE EMOCIONES */}
      <div className="emociones-container">
        {emociones.map((emocion) => (
          <button
            key={emocion.nombre}
            className={`emocion-btn ${
              emocionSeleccionada === emocion.nombre ? "activa" : ""
            }`}
            onClick={() => setEmocionSeleccionada(emocion.nombre)}
          >
            <span className="emoji">{emocion.emoji}</span>
            {emocion.nombre}
          </button>
        ))}
      </div>

      {/* VENTANA DEL CHAT */}
      <div className="chat-container">
        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={`mensaje ${msg.tipo === "usuario" ? "usuario" : "bao"}`}
          >
            {msg.tipo === "bao" && <span className="avatar">🐼</span>}
            <div className="burbuja">
              {msg.texto}
            </div>
          </div>
        ))}

        {pensando && (
          <div className="mensaje bao">
            <span className="avatar">🐼</span>
            <div className="burbuja">BAO está analizando tus palabras...</div>
          </div>
        )}
      </div>

      {/* INPUT DE TEXTO */}
      <textarea
        className="form-control mt-3"
        placeholder="Cuéntame cómo te sientes hoy..."
        value={mensajeUsuario}
        onChange={(e) => setMensajeUsuario(e.target.value)}
      />

      <button
        className="btn btn-primary mt-3"
        onClick={enviarMensajeIA}
      >
        Enviar mensaje 💬
      </button>
    </div>
  );
}

export default Home;