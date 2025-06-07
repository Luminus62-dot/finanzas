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
FRONTEND_URL=https://tu-frontend.vercel.app
PORT=5000
```

### Frontend (.env)

```
REACT_APP_API_URL=https://tu-backend.onrender.com
```

## Scripts

- `npm run dev`: corre frontend y backend en desarrollo (concurrently)
- `npm run start`: inicia la aplicación en producción

## Despliegue

- Configura variables de entorno en Render (backend) y Vercel (frontend).
- Usa `FRONTEND_URL` y `REACT_APP_API_URL` para enlazar ambos.

_V1.0 (funcional)_
