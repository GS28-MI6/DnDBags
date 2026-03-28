# DnDBags - Backend

API REST para el sistema de gestión de inventario de campañas DnD.

## Tecnologías

- Node.js + Express
- MySQL (mysql2)
- JWT (jsonwebtoken) + bcrypt
- express-validator
- dotenv, cors, uuid

## Requisitos previos

- Node.js >= 18
- MySQL >= 8.0
- npm

## Configuración

1. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tu configuración de base de datos y JWT secret.

3. Crea la base de datos y ejecuta los scripts SQL:
   ```bash
   mysql -u root -p < sql/schema.sql
   mysql -u root -p < sql/seed.sql
   ```

4. Instala dependencias:
   ```bash
   npm install
   ```

## Ejecución

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor corre en `http://localhost:3001` por defecto.

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Inicio de sesión |
| GET | /api/auth/me | Datos del usuario autenticado |
| GET | /api/campaigns | Mis campañas |
| POST | /api/campaigns | Crear campaña |
| POST | /api/campaigns/join | Unirse a campaña |
| GET | /api/campaigns/:id | Detalle de campaña |
| GET | /api/campaigns/:id/items | Pool de ítems de la campaña |
| POST | /api/campaigns/:id/custom-items | Crear ítem personalizado |
| POST | /api/campaigns/:id/overrides | Crear override de ítem base |
| POST | /api/campaigns/:id/characters | Crear personaje |
| GET | /api/campaigns/:id/characters | Personajes de la campaña |
| GET | /api/characters/:charId/items | Inventario del personaje |
| POST | /api/characters/:charId/items | Añadir ítem al inventario |
| PUT | /api/characters/:charId/items/:id | Actualizar cantidad |
| DELETE | /api/characters/:charId/items/:id | Eliminar ítem |
| GET | /api/characters/:charId/currency | Moneda del personaje |
| PUT | /api/characters/:charId/currency | Actualizar moneda |
