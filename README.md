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
- `npm run start-frontend`: usa `cross-env` para configurar variables de entorno antes de ejecutar React

## Despliegue

- Configura variables de entorno en Render (backend) y Vercel (frontend).
- Usa `FRONTEND_URL` y `REACT_APP_API_URL` para enlazar ambos.

## Endpoints destacados

### Suscripciones
- **`/api/subscriptions`** `GET/POST/PUT/DELETE`
  - Administra las suscripciones guardadas del usuario.
- **`POST /api/subscriptions/:id/charge`**
  - Registra un cobro creando una transacción con categoría "Suscripción".

## Páginas de React

- **`/subscriptions`**: módulo para gestionar y registrar cobros periódicos.

_V1.0 (funcional)_
