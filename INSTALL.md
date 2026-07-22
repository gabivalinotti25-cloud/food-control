# Guía de Instalación Rápida - Food Control

## Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL
- Git

## Instalación

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd food-control
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

#### Configurar variables de entorno
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales de PostgreSQL:
```
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/food_control"
JWT_SECRET="tu-clave-segura-aqui"
```

#### Ejecutar migraciones de base de datos
```bash
npx prisma migrate dev
```

#### Crear usuario administrador
```bash
node src/scripts/crearAdmin.js
```

#### Iniciar servidor backend
```bash
npm run dev
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

#### Iniciar servidor frontend
```bash
npm run dev
```

## Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Usuario Admin**: admin@foodcontrol.com
- **Contraseña Admin**: admin123

⚠️ **IMPORTANTE**: Cambia la contraseña del admin después del primer login.

## Primeros Pasos

1. **Iniciar sesión** con el usuario admin
2. **Registrar empleados** en la configuración (solo admin)
3. **Configurar el menú** por día de la semana
4. **Agregar productos** al catálogo
5. **Comenzar a usar** el sistema

## Solución de Problemas

### Error de conexión a base de datos
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos exista

### Error de migración
- Elimina la base de datos y vuelve a crearla
- Ejecuta `npx prisma migrate reset`

### Error de autenticación
- Verifica que el usuario admin esté creado
- Revisa las variables de entorno JWT_SECRET
- Limpia el localStorage del navegador

## Producción

Para desplegar en producción:

1. **Backend**:
   - Cambia `JWT_SECRET` a una clave segura
   - Usa variables de entorno reales
   - Considera usar un servidor de producción (PM2, Docker)

2. **Frontend**:
   - Ejecuta `npm run build`
   - Despliega el directorio `dist` en tu servidor web
   - Configura HTTPS para seguridad

3. **Base de datos**:
   - Usa una base de datos PostgreSQL en producción
   - Configura backups regulares
   - Considera usar un servicio de base de datos gestionado

## Soporte

Para reportes de bugs o sugerencias, contactar al equipo de desarrollo.
