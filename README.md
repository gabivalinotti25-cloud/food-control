# Food Control

Sistema completo y profesional para la gestión de negocios de comidas, con control de pedidos, clientes, caja diaria, deudas y estadísticas.

## Características Principales

### 🍽️ Gestión de Menú
- **Platos fijos** configurables por día de la semana (lunes a viernes)
- **Platos especiales** diarios (1-2 por día según configuración)
- **Menú reducido los sábados**
- **Productos libres** para ventas sin nombre
- Agregar, eliminar y modificar platos del menú diariamente

### 👥 Gestión de Clientes
- Registro completo de clientes (nombre, teléfono, dirección, observaciones)
- Control de **cuenta corriente** con saldo
- Historial de pedidos por cliente
- Clientes frecuentes y nuevos

### 💰 Control de Pagos y Deudas
- **Tres métodos de pago**: Efectivo, Transferencia, Cuenta Corriente
- Registro automático de deudas cuando no pagan en el día
- Sistema de pagos para saldar deudas
- Reporte de clientes con deuda pendiente
- Control de montos por cobrar

### 💵 Caja Diaria
- **Apertura y cierre de caja** diaria
- Control de **efectivo real vs esperado**
- Control de **transferencias recibidas**
- Registro de diferencias con observaciones
- Resumen completo del día (pedidos, ventas anónimas, ingresos)

### 📊 Ventas Anónimas
- Registro de **montos sin cliente** específico
- Ideal para ventas de mostrador o consumos anotados
- Clasificación por forma de pago (efectivo/transferencia)
- Descripción opcional para referencia

### 📈 Estadísticas y Reportes
- **Dashboard** con resumen general del negocio
- Estadísticas por período (hoy, semana, mes, año)
- **Productos más vendidos**
- **Clientes más frecuentes**
- Tendencias de ventas (últimos 30 días)
- Reportes diarios detallados

### ⚙️ Configuración
- **Configuración de menú por día de la semana**
- Activar/desactivar productos fijos por día
- Configurar cantidad máxima de platos especiales
- **Exportación de datos** (backup completo, clientes, reportes)
- Estadísticas del sistema

## Arquitectura del Sistema

### Backend (Node.js + Express + Prisma)
- **API REST** completa con todos los endpoints
- **Base de datos PostgreSQL** con Prisma ORM
- Modelos: Cliente, Producto, Pedido, Pago, VentaAnonima, CajaDiaria, ConfiguracionMenu
- Controladores especializados por funcionalidad
- Sistema de rutas modular

### Frontend (React + Vite)
- **Interfaz moderna y profesional**
- Navegación con React Router
- Consumo de API con Axios
- Diseño responsivo con Tailwind CSS
- Componentes reutilizables

## Estructura del Proyecto

```
food-control/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelo de datos
│   ├── src/
│   │   ├── controllers/           # Lógica de negocio
│   │   ├── routes/               # Endpoints API
│   │   └── server.js             # Servidor Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Componentes UI
│   │   ├── pages/                # Páginas de la aplicación
│   │   ├── layouts/              # Layouts principales
│   │   └── services/             # Cliente API
│   └── package.json
└── README.md
```

## Instalación y Ejecución

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL
- Git

### Backend

1. Navegar al directorio backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar base de datos en `.env`:
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/food_control"
JWT_SECRET="tu-secret-key-aqui"
```

4. Ejecutar migraciones:
```bash
npx prisma migrate dev
```

5. Crear usuario administrador inicial:
```bash
node src/scripts/crearAdmin.js
```

6. Iniciar servidor (desarrollo):
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. Navegar al directorio frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Autenticación y Seguridad

### Usuario Admin Inicial
- **Email**: admin@foodcontrol.com
- **Contraseña**: admin123
- **Rol**: ADMIN

⚠️ **IMPORTANTE**: Cambia la contraseña del admin después del primer login.

### Roles de Usuario
- **ADMIN**: Acceso completo a todas las funcionalidades, incluyendo configuración y gestión de usuarios
- **EMPLEADO**: Acceso limitado a operaciones diarias (pedidos, clientes, caja, menú, estadísticas)

### Seguridad
- Sistema de autenticación con JWT (JSON Web Tokens)
- Todas las rutas del backend están protegidas
- Las rutas del frontend requieren autenticación
- Tokens expiran en 24 horas
- Redirección automática al login si el token expira

### PWA (Progressive Web App)- Instalable en dispositivos móviles
- Funciona offline (service worker)
- Se puede instalar como app nativa
- Iconos personalizados
- Actualización automática del contenido

## Uso del Sistema

### Flujo de Trabajo Diario

1. **Configurar menú del día**:
   - Copiar productos fijos (automático por configuración)
   - Agregar platos especiales del día
   - Ajustar según necesidades

2. **Registrar pedidos**:
   - Seleccionar cliente
   - Agregar productos del menú
   - Definir forma de pago (efectivo/transferencia/cuenta)
   - Los pedidos no pagados se registran como deuda

3. **Registrar ventas anónimas**:
   - Para ventas sin cliente específico
   - Clasificar por forma de pago

4. **Cierre de caja**:
   - Verificar montos esperados vs reales
   - Registrar diferencias
   - Cerrar caja diaria

5. **Revisar estadísticas**:
   - Consultar dashboard
   - Ver productos más vendidos
   - Analizar tendencias

### Gestión de Deudas

1. Ver clientes con deuda en Dashboard o Cuenta Corriente
2. Registrar pagos cuando los clientes abonen
3. El saldo se actualiza automáticamente
4. Marcar pedidos específicos como pagados

## Exportación y Backup

El sistema permite exportar:
- **Backup completo**: Todos los datos del sistema
- **Clientes**: Base de datos de clientes con historial
- **Reporte diario**: Resumen detallado de un día específico

Los archivos se exportan en formato JSON para fácil manipulación.

## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos relacional
- **CORS** - Habilitación de peticiones cross-origin

### Frontend
- **React** - Biblioteca UI
- **Vite** - Herramienta de build
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS

## Características Técnicas

- **API REST** con endpoints bien definidos
- **Base de datos relacional** con integridad referencial
- **Sistema de cuentas corrientes** automático
- **Control de concurrencia** para operaciones críticas
- **Validación de datos** en backend y frontend
- **Manejo de errores** robusto
- **Interfaz responsiva** para diferentes dispositivos

## Licencia

MIT

## Soporte

Para reportes de bugs o sugerencias, por favor contactar al equipo de desarrollo.
