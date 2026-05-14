CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.personas (
    id SERIAL PRIMARY KEY,
    tipo_identificacion VARCHAR(20),
    numero_identificacion VARCHAR(50),
    nombre_completo VARCHAR(255),
    correo_electronico VARCHAR(255),
    telefono VARCHAR(50),
    fecha_nacimiento DATE
);

CREATE TABLE IF NOT EXISTS core.api_logs (
    id SERIAL PRIMARY KEY,
    metodo VARCHAR(20),
    endpoint VARCHAR(255),
    mensaje TEXT,
    detalle TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);