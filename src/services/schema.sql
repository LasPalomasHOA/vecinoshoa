-- ==============================================================================
-- LAS PALOMAS SEASIDE GOLF COMMUNITY - BASE DE DATOS POSTGRESQL / SUPABASE
-- ==============================================================================

-- 1. Catálogo de Edificios (Torres: Diamante, Topaz, Rubi, etc.)
CREATE TABLE IF NOT EXISTS edificios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Grupos de Propiedad (Configuraciones de cobranza: NR, POOL, etc.)
CREATE TABLE IF NOT EXISTS grupos_propiedad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    fechas_cobro BOOLEAN DEFAULT FALSE,
    intereses_moratorios BOOLEAN DEFAULT FALSE,
    balance_bajo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Usuarios / Residentes / Propietarios (Campos simplificados)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Dueño',
    idioma VARCHAR(10) DEFAULT 'es',
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive, Suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Propiedades / Condominios
CREATE TABLE IF NOT EXISTS propiedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- ej. "A 101"
    edificio_id INT NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
    grupo_id INT REFERENCES grupos_propiedad(id) ON DELETE SET NULL,
    
    -- Características internas
    piso INT,
    area VARCHAR(80),
    tipo_cuarto VARCHAR(80),
    dormitorios INT DEFAULT 0,
    banos NUMERIC(3, 1) DEFAULT 0,
    capacidad_personas INT DEFAULT 0,
    max_carros INT DEFAULT 1,
    
    -- Datos fiscales, medidores y administración
    id_impuesto VARCHAR(100),
    medidor_agua VARCHAR(60),
    medidor_electricidad VARCHAR(60),
    empresa_manejadora VARCHAR(120),
    moneda VARCHAR(5) DEFAULT 'USD',
    estado VARCHAR(20) DEFAULT 'Active',
    cuota_hoa NUMERIC(10, 2) DEFAULT 0.00,
    notas TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Asignación de Propietarios a Propiedades (Relación N:M)
CREATE TABLE IF NOT EXISTS propiedad_usuarios (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_relacion VARCHAR(30) DEFAULT 'Owner', -- Owner, Tenant, Co-owner
    es_principal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(propiedad_id, usuario_id)
);

-- 6. Huéspedes (Solo datos de contacto esenciales)
CREATE TABLE IF NOT EXISTS huespedes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(25),
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reservaciones
CREATE TABLE IF NOT EXISTS reservaciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50),
    propiedad_id INT NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
    huesped_id INT NOT NULL REFERENCES huespedes(id) ON DELETE RESTRICT,
    tipo_huesped VARCHAR(50),               -- ej. Dueño, Huésped con Cobro, Huésped sin Cobro, Renta, etc.
    fecha_checkin DATE NOT NULL,
    fecha_checkout DATE NOT NULL,
    numero_ocupantes INT DEFAULT 1,
    numero_autos INT DEFAULT 0,
    notas TEXT,
    brazaletes VARCHAR(100),
    vehiculo_info VARCHAR(150),
    balance NUMERIC(10, 2) DEFAULT 0.00,
    estado VARCHAR(30) DEFAULT 'Confirmada', -- Confirmada, En Casa (Checked-in), Checked-out, Pendiente, Cancelada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Solicitudes de Acceso / Pases de Trabajo
CREATE TABLE IF NOT EXISTS solicitudes_acceso (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
    creador_nombre VARCHAR(100) NOT NULL,
    solicitud VARCHAR(255) NOT NULL,
    procesador_nombre VARCHAR(100),
    fecha_esperada DATE NOT NULL,
    comentario TEXT,
    estatus VARCHAR(30) DEFAULT 'Pendiente', -- Pendiente, En Proceso, Aprobado, Rechazado, Completado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_propiedades_edificio ON propiedades(edificio_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_propiedad ON reservaciones(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fechas ON reservaciones(fecha_checkin, fecha_checkout);
CREATE INDEX IF NOT EXISTS idx_propiedad_usuarios_prop ON propiedad_usuarios(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_propiedad_usuarios_user ON propiedad_usuarios(usuario_id);
