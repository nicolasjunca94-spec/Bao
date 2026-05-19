
from google import genai
import azure.functions as func
import json
import logging
import os
import psycopg2

# =========================
# CONFIG GEMINI
# =========================
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = func.FunctionApp()

# =========================
# CONEXIÓN DB
# =========================
def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        sslmode="require"
    )

# =========================
# LOG DE ERRORES
# =========================
def registrar_error(cursor, metodo, endpoint, mensaje, detalle=""):
    try:
        cursor.execute("""
            INSERT INTO core.api_logs (metodo, endpoint, mensaje, detalle)
            VALUES (%s, %s, %s, %s)
        """, (metodo, endpoint, mensaje, detalle))
    except Exception as e:
        logging.error(f"No se pudo registrar error: {str(e)}")

# =========================
# GET TODAS LAS PERSONAS
# =========================
@app.route(route="personas", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def obtener_personas(req: func.HttpRequest) -> func.HttpResponse:

    conn = None
    cursor = None

    try:

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM core.personas ORDER BY id")
        rows = cursor.fetchall()

        personas = []

        for r in rows:
            personas.append({
                "id": r[0],
                "tipo_identificacion": r[1],
                "numero_identificacion": r[2],
                "nombre_completo": r[3],
                "correo_electronico": r[4],
                "telefono": r[5],
                "fecha_nacimiento": str(r[6]) if r[6] else None
            })

        return func.HttpResponse(
            json.dumps(personas),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:

        logging.error(str(e))

        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================
# GET PERSONA POR ID
# =========================
@app.route(route="personas/{id}", methods=["GET"], auth_level=func.AuthLevel.ANONYMOUS)
def obtener_persona(req: func.HttpRequest) -> func.HttpResponse:

    conn = None
    cursor = None

    try:

        persona_id = req.route_params.get("id")

        if not persona_id:
            return func.HttpResponse(
                json.dumps({"error": "ID requerido"}),
                status_code=400,
                mimetype="application/json"
            )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM core.personas WHERE id=%s",
            (persona_id,)
        )

        row = cursor.fetchone()

        if not row:
            return func.HttpResponse(
                json.dumps({"mensaje": "Persona no encontrada"}),
                status_code=404,
                mimetype="application/json"
            )

        persona = {
            "id": row[0],
            "tipo_identificacion": row[1],
            "numero_identificacion": row[2],
            "nombre_completo": row[3],
            "correo_electronico": row[4],
            "telefono": row[5],
            "fecha_nacimiento": str(row[6]) if row[6] else None
        }

        return func.HttpResponse(
            json.dumps(persona),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:

        logging.error(str(e))

        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================
# CREAR PERSONA
# =========================
@app.route(route="personas", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def crear_persona(req: func.HttpRequest) -> func.HttpResponse:

    conn = None
    cursor = None

    try:

        try:
            data = req.get_json()

        except:
            return func.HttpResponse(
                json.dumps({"error": "JSON inválido"}),
                status_code=400,
                mimetype="application/json"
            )

        required_fields = [
            "tipo_identificacion",
            "numero_identificacion",
            "nombre_completo",
            "correo_electronico"
        ]

        for field in required_fields:

            if field not in data:

                return func.HttpResponse(
                    json.dumps({"error": f"Falta campo: {field}"}),
                    status_code=400,
                    mimetype="application/json"
                )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO core.personas
            (
                tipo_identificacion,
                numero_identificacion,
                nombre_completo,
                correo_electronico,
                telefono,
                fecha_nacimiento
            )
            VALUES (%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            data["tipo_identificacion"],
            data["numero_identificacion"],
            data["nombre_completo"],
            data["correo_electronico"],
            data.get("telefono"),
            data.get("fecha_nacimiento")
        ))

        new_id = cursor.fetchone()[0]

        conn.commit()

        return func.HttpResponse(
            json.dumps({
                "mensaje": "Persona creada correctamente",
                "id": new_id
            }),
            status_code=201,
            mimetype="application/json"
        )

    except Exception as e:

        logging.error(str(e))

        if conn:
            conn.rollback()

        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================
# ELIMINAR PERSONA
# =========================
@app.route(route="personas/{id}", methods=["DELETE"], auth_level=func.AuthLevel.ANONYMOUS)
def eliminar_persona(req: func.HttpRequest) -> func.HttpResponse:

    conn = None
    cursor = None

    try:

        persona_id = req.route_params.get("id")

        if not persona_id:
            return func.HttpResponse(
                json.dumps({"error": "ID requerido"}),
                status_code=400,
                mimetype="application/json"
            )

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM core.personas WHERE id=%s",
            (persona_id,)
        )

        conn.commit()

        return func.HttpResponse(
            json.dumps({"mensaje": "Persona eliminada"}),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:

        logging.error(str(e))

        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================
# LOGIN
# =========================
@app.route(route="login", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def login(req: func.HttpRequest) -> func.HttpResponse:

    conn = None
    cursor = None

    try:

        data = req.get_json()

        tipo = data.get("tipo_identificacion")
        numero = data.get("numero_identificacion")

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT nombre_completo
            FROM core.personas
            WHERE tipo_identificacion = %s
            AND numero_identificacion = %s
        """, (tipo, numero))

        user = cursor.fetchone()

        if user:

            return func.HttpResponse(
                json.dumps({
                    "mensaje": "Login exitoso",
                    "usuario": user[0]
                }),
                status_code=200,
                mimetype="application/json"
            )

        else:

            return func.HttpResponse(
                json.dumps({
                    "error": "Credenciales incorrectas"
                }),
                status_code=401,
                mimetype="application/json"
            )

    except Exception as e:

        logging.error(str(e))

        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


# =========================
# CHAT IA
# =========================
@app.route(route="chat", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def chat(req: func.HttpRequest) -> func.HttpResponse:

    try:

        logging.info("CHAT EJECUTANDO")

        data = req.get_json()

        emocion = data.get("emocion", "")
        mensaje = data.get("mensaje", "")
        
        logging.info("ANTES DE GENERATE_CONTENT")
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
Actúa como Bao, un asistente de bienestar emocional diseñado
para estudiantes universitarios de ingeniería de sistemas.

Tu personalidad debe sentirse:
- humana
- cercana
- empática
- calmada
- conversacional
- natural

NO hables como terapeuta clínico.
NO uses respuestas robóticas o genéricas.
NO repitas siempre las mismas frases.

Tu objetivo es:
- acompañar emocionalmente
- ayudar a manejar estrés académico
- fomentar regulación emocional saludable
- brindar apoyo emocional preventivo

El estudiante reporta esta emoción:
{emocion}

Mensaje del estudiante:
{mensaje}

INSTRUCCIONES IMPORTANTES:

1. Responde de forma NATURAL y conversacional.
2. Primero valida emocionalmente al estudiante.
3. Luego ofrece apoyo emocional breve y humano.
4. NO entregues automáticamente ejercicios,
   música y consejos completos.
5. En cambio, ofrece opciones para que el usuario elija
   qué tipo de ayuda desea recibir. Todo esto a final de cada mensaje.

Las opciones posibles son:
- ejercicio
- musica
- consejos
- respiracion
- manejo_estres

IMPORTANTE:
- Nunca hagas sentir juzgado al usuario.
- Nunca refuerces desesperanza o ansiedad.
- Mantén respuestas relativamente breves.
- Usa lenguaje cálido y universitario.
- Evita parecer un sistema automatizado.

Responde ÚNICAMENTE en JSON válido con esta estructura:

{{
  "mensaje": "respuesta emocional natural y humana",
  "opciones": [
    "ejercicio",
    "musica",
    "consejos"
  ]
}}

NO incluyas texto fuera del JSON.
"""
        logging.info("DESPUES DE GENERATE_CONTENT")
        response = model.generate_content(prompt)

        texto = response.text.strip()

        # limpiar markdown
        texto = texto.replace("```json", "")
        texto = texto.replace("```", "")
        texto = texto.strip()

        logging.info(f"RESPUESTA GEMINI: {texto}")

        try:

            respuesta_json = json.loads(texto)

        except Exception as json_error:

            logging.error(f"ERROR JSON GEMINI: {str(json_error)}")

            return func.HttpResponse(
                json.dumps({
                    "error": "Gemini devolvió JSON inválido",
                    "detalle": texto
                }),
                status_code=500,
                mimetype="application/json"
            )

        return func.HttpResponse(
            json.dumps(respuesta_json),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:

        logging.error(f"ERROR CHAT: {str(e)}")

        return func.HttpResponse(
            json.dumps({
                "error": str(e)
            }),
            mimetype="application/json",
            status_code=500
        )