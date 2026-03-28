# DnDBags — Sistema de Inventario para Campañas DnD

Sistema web completo para gestionar inventarios de campañas de Dungeons & Dragons. Toda la interfaz está en español.

## Estructura del Proyecto

```
├── README.md                  ← este archivo
├── backend/                   ← Node.js + Express + MySQL
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   ├── sql/
│   │   ├── schema.sql         ← tablas, FK, índices
│   │   └── seed.sql           ← rulesets, item_types, base_items
│   └── src/
│       ├── app.js
│       ├── config/db.js
│       ├── middleware/auth.js
│       ├── routes/
│       ├── controllers/
│       └── validators/
└── frontend/                  ← React 18 + Vite
    ├── package.json
    ├── .env.example
    ├── README.md
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/
        ├── pages/
        └── styles/
```

## Stack Tecnológico

- **Frontend:** React 18, Vite, react-router-dom v6, axios, react-toastify, CSS plano
- **Backend:** Node.js, Express, mysql2 (promise pool), bcrypt, jsonwebtoken, express-validator, express-rate-limit
- **Base de datos:** MySQL 8+

## Inicio Rápido

### 1. Base de Datos

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p < backend/sql/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de MySQL y JWT_SECRET
npm install
npm run dev
```

El backend corre en `http://localhost:3001`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api (ya configurado por defecto)
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`.

## Funcionalidades

- **Autenticación** — Registro e inicio de sesión con JWT
- **Campañas** — Crear, listar propias, unirse por ID, compartir ID
- **Personajes** — Crear personajes dentro de una campaña
- **Inventario** — Añadir/quitar ítems con búsqueda typeahead, peso en libras
- **Pool de ítems** — Base del ruleset + personalizados + overrides
- **Overrides** — Editar cualquier ítem base solo para esa campaña
- **Moneda** — PC, PP, PE, PO, PPT (cada moneda pesa 0.02 lb)
- **Modo oscuro** — Toggle con persistencia en localStorage
- **Responsive** — Optimizado para móvil y escritorio