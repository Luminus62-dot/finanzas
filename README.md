# Mi Dinero Hoy

## Descripción

Aplicación full-stack para gestión de finanzas personales.

## Estructura del proyecto

- **backend/**: API REST en Node.js + Express
- **frontend/**: SPA con React

## Variables de entorno

### Backend (.env)

```
MONGO_URI=
JWT_SECRET=
# FRONTEND_URL puede ser una URL o varias separadas por comas
FRONTEND_URL=https://tu-frontend.vercel.app
# Para comodines se puede usar FRONTEND_URL_REGEX
# Ejemplo para aceptar cualquier subdominio de Vercel
# FRONTEND_URL_REGEX=^https://.*\.vercel\.app$
PORT=5000
```

### Frontend (.env)

```
REACT_APP_API_URL=https://tu-backend.onrender.com
```
**Importante:** no añadas una barra al final de `REACT_APP_API_URL` para evitar
URLs duplicadas al construir las rutas.

## Scripts

- `npm run dev`: corre frontend y backend en desarrollo (concurrently)
- `npm run start`: inicia la aplicación en producción

## Despliegue

- Configura variables de entorno en Render (backend) y Vercel (frontend).
- Usa `FRONTEND_URL` y `REACT_APP_API_URL` para enlazar ambos.

## Endpoints destacados

- **`/api/reminders`** `GET/POST/PUT/DELETE`
  - Gestiona recordatorios del usuario (listar, crear, editar y eliminar).
  - `GET /api/reminders/upcoming?days=7` devuelve los próximos recordatorios.
- **`/api/currency/convert`** `GET`
  - Convierte cantidades entre USD, EUR, COP y MXN.

## Páginas de React

- **`/reminders`**: página para crear y administrar recordatorios.
- **`/converter`**: convertidor de monedas utilizando el endpoint anterior.

_V1.0 (funcional)_
