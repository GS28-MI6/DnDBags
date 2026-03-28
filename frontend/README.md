# DnDBags - Frontend

Interfaz web para el sistema de gestión de inventario de campañas DnD.

## Tecnologías

- React 18 + Vite
- react-router-dom v6
- axios (con interceptor JWT)
- react-toastify
- CSS plano (con soporte dark mode)

## Requisitos previos

- Node.js >= 18
- npm
- Backend corriendo (ver `../backend/README.md`)

## Configuración

1. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Asegúrate de que `VITE_API_URL` apunte al backend (por defecto `http://localhost:3001/api`).

3. Instala dependencias:
   ```bash
   npm install
   ```

## Ejecución

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

El frontend corre en `http://localhost:5173` por defecto.

## Funcionalidades

- Registro e inicio de sesión con JWT
- Listado de campañas del usuario
- Crear nueva campaña (con selección de ruleset: 5e, 4e)
- Unirse a campaña por ID
- Compartir ID de campaña (copia al portapapeles)
- Gestión de personajes dentro de la campaña
- Inventario por personaje con peso total en libras
- Añadir ítems con búsqueda typeahead
- Crear ítems personalizados
- Editar ítems (overrides para ítems base)
- Gestión de monedas (PC, PP, PE, PO, PPT)
- Acordeón colapsable por personaje
- Modo oscuro con toggle y persistencia
- Responsive (móvil y escritorio)
