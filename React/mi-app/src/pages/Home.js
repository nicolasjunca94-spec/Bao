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

  // agregar mensaje usuario
  setMensajes(prev => [
    ...prev,
    { tipo: "usuario", texto: mensajeUsuario }
  ]);

  setPensando(true);

  try {

    const url = `${process.env.REACT_APP_API_URL}/chat`;

    const opciones = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emocion: emocionSeleccionada,
        mensaje: mensajeUsuario
      })
    };

    const response = await fetch(url, opciones);

    if (!response.ok) {
      throw new Error("Error en API: " + response.status);
    }

    const data = await response.json();

    console.log("Respuesta IA:", data);

    let texto = data.respuesta;

    texto = texto.replace(/```json/g, "").replace(/```/g, "").trim();

    const respuesta = JSON.parse(texto);

    setPensando(false);

    // respuestas del Panda
    setMensajes(prev => [
      ...prev,
      { tipo: "bao", texto: respuesta.apoyo },
      { tipo: "bao", texto: respuesta.consejos },
      { tipo: "bao", texto: respuesta.ejercicio },
      { tipo: "bao", texto: "🎵 " + respuesta.musica }
    ]);

    setMensajeUsuario("");

  } catch (error) {

    setPensando(false);
    console.error("Error llamando IA:", error);

  }

};

return (

<div className="container mt-5">

<h2 className="mb-4 text-center">Habla con BAO 🐼</h2>

{/* AVATAR ANIMADO */}
<BaoAvatar pensando={pensando} />

{/* EMOCIONES */}

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

{/* CHAT */}

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
<div className="burbuja">BAO está pensando...</div>
</div>
)}

</div>

{/* INPUT */}

<textarea
className="form-control mt-3"
placeholder="Cuéntame cómo te sientes..."
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