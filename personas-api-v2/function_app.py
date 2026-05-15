import google as genai
import google.generativeai as genai
import azure.functions as func
import json
import logging
import os
import psycopg2

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

        cursor.execute("SELECT * FROM core.personas WHERE id=%s", (persona_id,))
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
            (tipo_identificacion, numero_identificacion, nombre_completo,
             correo_electronico, telefono, fecha_nacimiento)
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

        cursor.execute("DELETE FROM core.personas WHERE id=%s", (persona_id,))
        conn.commit()

        return func.HttpResponse(
            json.dumps({"mensaje": "Persona eliminada"}),
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
            
@app.route(route="chat", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def chat(req: func.HttpRequest) -> func.HttpResponse:
    print("CHAT EJECUTANDO")
    print("BODY:", req.get_body())
    
    try:

        data = req.get_json()

        emocion = data.get("emocion")
        mensaje = data.get("mensaje")

        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        print("ANTES GEMINI")
        prompt = f"""
Actúa como un asistente de bienestar emocional llamado "Bao".

Tu propósito es brindar acompañamiento emocional preventivo
a estudiantes de ingeniería de sistemas de la Universidad EAN.

Tu personalidad debe ser:
- empática
- respetuosa
- positiva
- calmada
- cercana

Nunca juzgues al usuario.

Tu objetivo es ayudar a los estudiantes a:
- manejar el estrés académico
- regular sus emociones
- encontrar estrategias saludables para su bienestar

El estudiante reporta la emoción principal:
{emocion}

Mensaje del estudiante:
{mensaje}

Analiza el mensaje y genera una respuesta que incluya:

1. Un mensaje de apoyo emocional empático.
2. Consejos prácticos para manejar la emoción.
3. Un ejercicio sencillo de regulación emocional
   (respiración, pausa mental, mindfulness o relajación).
4. Una recomendación musical positiva que ayude a mejorar el estado emocional.

Reglas importantes:

- Nunca refuerces emociones negativas.
- No promuevas tristeza, ansiedad o desesperanza.
- Siempre orienta la respuesta hacia la regulación emocional.
- Usa un lenguaje claro y amigable para estudiantes universitarios.
- Evita respuestas demasiado largas.

Responde únicamente en formato JSON con esta estructura:

{
"apoyo": "mensaje empático breve",
"consejos": "2 o 3 recomendaciones prácticas",
"ejercicio": "ejercicio corto paso a paso",
"musica": "nombre de la canción o tipo de música recomendada"
}

No incluyas texto fuera del JSON.
"""
        response = model.generate_content(prompt)
        print(response.text)
        return func.HttpResponse(
            json.dumps({
                "respuesta": response.text
            }),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        print("ERROR REAL:")
        print(repr(e))
        return func.HttpResponse(
            
            json.dumps({"error": str(e)}),
            mimetype="application/json",
            status_code=500
        )