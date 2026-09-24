-- ==============================================================================
-- LAS PALOMAS SEASIDE GOLF COMMUNITY - BASE DE DATOS POSTGRESQL / SUPABASE
-- Esquema: gestion_residencial
-- Copia este script y ejecútalo en el SQL Editor de Supabase / Postgres / Neon
-- ==============================================================================

-- 0. Crear el esquema gestion_residencial si no existe
CREATE SCHEMA IF NOT EXISTS gestion_residencial;

-- 1. Catálogo de Edificios (Torres: Diamante, Topaz, Rubi, etc.)
CREATE TABLE IF NOT EXISTS gestion_residencial.edificios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Grupos de Propiedad (Configuraciones de cobranza: NR, POOL, etc.)
CREATE TABLE IF NOT EXISTS gestion_residencial.grupos_propiedad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    fechas_cobro BOOLEAN DEFAULT FALSE,
    intereses_moratorios BOOLEAN DEFAULT FALSE,
    balance_bajo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Usuarios / Residentes / Propietarios (Campos simplificados)
CREATE TABLE IF NOT EXISTS gestion_residencial.usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Dueño',
    telefono VARCHAR(25),
    idioma VARCHAR(10) DEFAULT 'es',
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inactive, Suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Propiedades / Condominios
CREATE TABLE IF NOT EXISTS gestion_residencial.propiedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- ej. "A 101"
    edificio_id INT NOT NULL REFERENCES gestion_residencial.edificios(id) ON DELETE CASCADE,
    grupo_id INT REFERENCES gestion_residencial.grupos_propiedad(id) ON DELETE SET NULL,
    
    -- Características internas
    piso INT DEFAULT 1,
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
CREATE TABLE IF NOT EXISTS gestion_residencial.propiedad_usuarios (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL REFERENCES gestion_residencial.propiedades(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES gestion_residencial.usuarios(id) ON DELETE CASCADE,
    tipo_relacion VARCHAR(30) DEFAULT 'Owner', -- Owner, Tenant, Co-owner
    es_principal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(propiedad_id, usuario_id)
);

-- 6. Huéspedes (Solo datos de contacto esenciales)
CREATE TABLE IF NOT EXISTS gestion_residencial.huespedes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(25),
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reservaciones
CREATE TABLE IF NOT EXISTS gestion_residencial.reservaciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50),
    propiedad_id INT NOT NULL REFERENCES gestion_residencial.propiedades(id) ON DELETE CASCADE,
    huesped_id INT NOT NULL REFERENCES gestion_residencial.huespedes(id) ON DELETE RESTRICT,
    tipo_huesped VARCHAR(50) DEFAULT 'Dueño', -- ej. Dueño, Huésped con Cobro (PG), Huésped sin Cobro (NPG), Renta / Streamline, etc.
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
CREATE TABLE IF NOT EXISTS gestion_residencial.solicitudes_acceso (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL REFERENCES gestion_residencial.propiedades(id) ON DELETE CASCADE,
    creador_nombre VARCHAR(100) NOT NULL,
    solicitud VARCHAR(255) NOT NULL,
    procesador_nombre VARCHAR(100),
    fecha_esperada DATE NOT NULL,
    comentario TEXT,
    estatus VARCHAR(30) DEFAULT 'Pendiente', -- Pendiente, En Proceso, Aprobado, Rechazado, Completado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento y Búsqueda en gestion_residencial
CREATE INDEX IF NOT EXISTS idx_propiedades_edificio ON gestion_residencial.propiedades(edificio_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_grupo ON gestion_residencial.propiedades(grupo_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_propiedad ON gestion_residencial.reservaciones(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_huesped ON gestion_residencial.reservaciones(huesped_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fechas ON gestion_residencial.reservaciones(fecha_checkin, fecha_checkout);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON gestion_residencial.reservaciones(estado);
CREATE INDEX IF NOT EXISTS idx_propiedad_usuarios_prop ON gestion_residencial.propiedad_usuarios(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_propiedad_usuarios_user ON gestion_residencial.propiedad_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_propiedad ON gestion_residencial.solicitudes_acceso(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estatus ON gestion_residencial.solicitudes_acceso(estatus);

-- ==============================================================================
-- PERMISOS ESTRICTAMENTE CRUD PARA EL USUARIO DE APLICACIÓN (SIN DDL / DROP)
-- ==============================================================================
GRANT USAGE ON SCHEMA gestion_residencial TO admin_acceso;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gestion_residencial TO admin_acceso;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gestion_residencial TO admin_acceso;

ALTER DEFAULT PRIVILEGES IN SCHEMA gestion_residencial GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO admin_acceso;
ALTER DEFAULT PRIVILEGES IN SCHEMA gestion_residencial GRANT USAGE, SELECT ON SEQUENCES TO admin_acceso;

-- ==============================================================================
-- DATOS INICIALES POR DEFECTO (SEMILLA / SEED)
-- ==============================================================================

-- Torres / Edificios
INSERT INTO gestion_residencial.edificios (id, nombre, activo) VALUES 
  (1, 'Torre Diamante', true),
  (2, 'Torre Topaz', true),
  (3, 'Torre Rubi', true),
  (4, 'Torre Opal', true),
  (5, 'Torre Cristales', true),
  (6, 'Torre Esmeralda', true)
ON CONFLICT (nombre) DO NOTHING;

-- Grupos de Cobranza / HOA
INSERT INTO gestion_residencial.grupos_propiedad (id, nombre, fechas_cobro, intereses_moratorios, balance_bajo) VALUES 
  (1, 'NR (No Rental / Uso Propio)', true, true, false),
  (2, 'POOL (Rental Pool Program)', true, false, true),
  (3, 'PREMIUM RESIDENCES', true, true, true)
ON CONFLICT (nombre) DO NOTHING;

-- Usuarios de Prueba (Dueños y Administradores)
INSERT INTO gestion_residencial.usuarios (id, email, nombre, apellido, rol, telefono, idioma, ciudad, estado, codigo_postal, status) VALUES 
  (1, 'roberto.garza@gmail.com', 'Roberto', 'Garza', 'Dueño', '638-102-3344', 'es', 'Puerto Peñasco', 'Sonora', '83550', 'Active'),
  (2, 'sarah.miller@cox.net', 'Sarah', 'Miller', 'Dueño', '480-555-0192', 'en', 'Phoenix', 'Arizona', '85001', 'Active'),
  (3, 'carlos.mendoza@laspalomas.com', 'Carlos', 'Mendoza', 'Dueño', '662-441-9988', 'es', 'Hermosillo', 'Sonora', '83000', 'Active'),
  (4, 'admin@laspalomas.com', 'Admin', 'HOA Manager', 'Administrador', '638-382-0000', 'es', 'Puerto Peñasco', 'Sonora', '83550', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Propiedades Iniciales
INSERT INTO gestion_residencial.propiedades (id, nombre, edificio_id, grupo_id, piso, area, tipo_cuarto, dormitorios, banos, capacidad_personas, max_carros, moneda, cuota_hoa, estado) VALUES 
  (1, 'Diamante 101', 1, 1, 1, '145 m²', 'Frente al Mar', 2, 2.0, 6, 2, 'USD', 450.00, 'Active'),
  (2, 'Topaz 404', 2, 2, 4, '180 m²', 'Vista al Mar / Piscina', 3, 2.5, 8, 2, 'USD', 580.00, 'Active'),
  (3, 'Rubi 202', 3, 1, 2, '110 m²', 'Vista Campo de Golf', 1, 1.5, 4, 1, 'USD', 320.00, 'Active'),
  (4, 'Cristales 701 (Penthouse)', 5, 3, 7, '260 m²', 'Penthouse Panorámico', 4, 4.0, 10, 3, 'USD', 850.00, 'Active')
ON CONFLICT (id) DO NOTHING;

-- Asignaciones Propiedad - Dueños
INSERT INTO gestion_residencial.propiedad_usuarios (propiedad_id, usuario_id, tipo_relacion, es_principal) VALUES 
  (1, 1, 'Owner', true),
  (2, 2, 'Owner', true),
  (3, 3, 'Owner', true),
  (4, 1, 'Owner', true)
ON CONFLICT (propiedad_id, usuario_id) DO NOTHING;

-- Huéspedes
INSERT INTO gestion_residencial.huespedes (id, nombres, apellidos, telefono, email) VALUES 
  (1, 'Alejandro', 'Vázquez Morales', '662-300-4411', 'alejandro.vazquez@gmail.com'),
  (2, 'Michael', 'Johnson', '602-555-8833', 'mjohnson@aztech.com'),
  (3, 'Daniela', 'Fernández', '638-111-2299', 'daniela.f@outlook.com')
ON CONFLICT (id) DO NOTHING;

-- Reservaciones Iniciales
INSERT INTO gestion_residencial.reservaciones (id, codigo, propiedad_id, huesped_id, tipo_huesped, fecha_checkin, fecha_checkout, numero_ocupantes, numero_autos, brazaletes, vehiculo_info, balance, estado) VALUES 
  (1, 'RES-202601', 1, 1, 'Dueño', '2026-09-20', '2026-09-26', 4, 1, 'Azul Diamante 101A-101D', 'GMC Sierra Blanca Sonora UBN-892', 0.00, 'En Casa (Checked-in)'),
  (2, 'RES-202602', 2, 2, 'Renta / Streamline', '2026-09-22', '2026-09-27', 6, 2, 'Verde Topaz 404-1 a 404-6', 'Ford Expedition Negra AZ ABC-1234', 0.00, 'En Casa (Checked-in)'),
  (3, 'RES-202603', 3, 3, 'Huésped con Cobro (PG)', '2026-09-25', '2026-09-29', 2, 1, 'Pendiente', 'Pendiente al arribo', 180.00, 'Confirmada')
ON CONFLICT (id) DO NOTHING;

-- Solicitudes de Acceso Iniciales
INSERT INTO gestion_residencial.solicitudes_acceso (id, propiedad_id, creador_nombre, solicitud, procesador_nombre, fecha_esperada, estatus, comentario) VALUES 
  (1, 1, 'Roberto Garza', 'Mantenimiento de Aire Acondicionado (Climas del Desierto)', 'Seguridad Caseta Norte', '2026-09-25', 'Aprobado', 'Técnico autorizado: José Luis Beltrán con identificación oficial.'),
  (2, 2, 'Sarah Miller', 'Entrega de Mueble de Terraza (Muebles Colonial)', 'Administración', '2026-09-27', 'Pendiente', 'Camión de carga para descarga en estacionamiento de servicio.')
ON CONFLICT (id) DO NOTHING;

-- Ajustar secuencias de ID en el esquema gestion_residencial
SELECT setval('gestion_residencial.edificios_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.edificios), 1));
SELECT setval('gestion_residencial.grupos_propiedad_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.grupos_propiedad), 1));
SELECT setval('gestion_residencial.usuarios_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.usuarios), 1));
SELECT setval('gestion_residencial.propiedades_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.propiedades), 1));
SELECT setval('gestion_residencial.propiedad_usuarios_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.propiedad_usuarios), 1));
SELECT setval('gestion_residencial.huespedes_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.huespedes), 1));
SELECT setval('gestion_residencial.reservaciones_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.reservaciones), 1));
SELECT setval('gestion_residencial.solicitudes_acceso_id_seq', COALESCE((SELECT MAX(id) FROM gestion_residencial.solicitudes_acceso), 1));
