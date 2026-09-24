# Las Palomas HOA - Seaside Golf Community Management System

Sistema integral de administración condominal y front desk para **Las Palomas Seaside Golf Community** con conexión directa a base de datos PostgreSQL (Supabase / Neon / Vercel Postgres).

---

## 🚀 Arquitectura de Base de Datos y Backend

El proyecto está diseñado para funcionar de manera unificada tanto en **desarrollo local** (`npm run dev`) como en producción en **Vercel** (`Serverless Functions`):

- **Local (`npm run dev`)**: Vite integra un middleware API en `vite.config.ts` que atiende las solicitudes `/api/*` directamente contra la base de datos PostgreSQL especificada en tu `.env`.
- **Producción (Vercel)**: Las funciones en `/api/[...route].ts` se ejecutan como Serverless Functions conectándose automáticamente usando las variables de entorno configuradas en el dashboard de Vercel.

---

## ⚙️ Variables de Entorno

Configura en tu archivo `.env` local o en las variables de entorno de **Vercel**:

```env
# 1. URL de conexión a PostgreSQL (Cualquiera de estas variables es soportada)
CUSTOM_DB_URL="postgres://usuario:password@host:6543/postgres?sslmode=require"
DATABASE_URL="postgres://usuario:password@host:6543/postgres?sslmode=require"
POSTGRES_URL="postgres://usuario:password@host:6543/postgres?sslmode=require"

# 2. Puerto opcional para servidor local
PORT=5000
```

---

## 🗄️ Esquema de Base de Datos (PostgreSQL)

Las tablas creadas y administradas por el sistema son:

1. **`edificios`**: Catálogo de torres (Diamante, Topaz, Rubi, Opal, Cristales, Esmeralda).
2. **`grupos_propiedad`**: Grupos de cobranza y HOA (NR, POOL, Premium).
3. **`usuarios`**: Dueños, administradores, residentes y personal con roles y estatus.
4. **`propiedades`**: Condominios con características (piso, cuartos, baños, medidores, cuota HOA, etc.).
5. **`propiedad_usuarios`**: Relación N:M entre condominios y propietarios.
6. **`huespedes`**: Directorio y datos de contacto de huéspedes.
7. **`reservaciones`**: Reservaciones con fechas de check-in / check-out, ocupantes, brazaletes, vehículos, balance, estatus ('Confirmada', 'En Casa (Checked-in)', 'Checked-out', 'Cancelada') y validación de traslape.
8. **`solicitudes_acceso`**: Pases de contratistas, entregas y proveedores con seguimiento de autorización.

### 📥 Creación de Tablas en Supabase / Postgres:

1. Abre el archivo [`database_setup.sql`](file:///c:/Users/omarz/Desktop/vecinoshoa/database_setup.sql).
2. Copia y pega el contenido en el **SQL Editor** de tu proyecto Supabase o Postgres.
3. Haz clic en **Run** para crear todas las tablas, índices y datos demo iniciales.

---

## 🌐 Endpoints de la API (`/api/*`)

| Módulo | Endpoint | Métodos | Descripción |
| :--- | :--- | :--- | :--- |
| **Diagnóstico** | `/api/health` | `GET` | Estado de conexión y conteo de tablas en PostgreSQL |
| **Edificios** | `/api/edificios` | `GET`, `POST`, `PUT`, `DELETE` | CRUD de Torres / Edificios |
| **Grupos** | `/api/grupos_propiedad` | `GET`, `POST`, `PUT`, `DELETE` | CRUD de Grupos de Cobranza |
| **Usuarios** | `/api/usuarios` | `GET`, `POST`, `PUT`, `DELETE` | CRUD de Residentes, Dueños y Personal |
| **Propiedades** | `/api/propiedades` | `GET`, `POST`, `PUT`, `DELETE` | CRUD de Condominios con asignación de dueños |
| **Asignaciones** | `/api/propiedad_usuarios`| `GET`, `POST`, `DELETE` | Relación N:M entre propiedades y dueños |
| **Huéspedes** | `/api/huespedes` | `GET`, `POST`, `PUT`, `DELETE` | CRUD de Huéspedes |
| **Reservaciones** | `/api/reservaciones` | `GET`, `POST`, `PUT`, `DELETE` | Reservaciones con prevención de doble reserva |
| **Pases** | `/api/solicitudes` | `GET`, `POST`, `PUT` | Solicitudes y pases de acceso con flujo de aprobación |

---

## 💻 Comandos Disponibles

- `npm run dev`: Inicia la aplicación localmente con el backend API y la base de datos integrados.
- `npm run build`: Compila la aplicación para producción (TypeScript + Vite).
- `npm run preview`: Previsualiza la versión compilada.
