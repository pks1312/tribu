# Tribu Frontend

Frontend de la aplicación web de La Tribu - Salón y Barbería. Desarrollado con React, TypeScript y Vite.

## Características

- 🎨 Interfaz moderna y responsive
- 📅 Sistema de reservas de citas
- 👤 Gestión de perfiles de usuario
- 🖼️ Galería de trabajos
- ⭐ Sistema de testimonios
- 🌙 Modo claro/oscuro
- 📱 Diseño mobile-first

## Tecnologías

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos

## Requisitos

- Node.js 18 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/pks1312/TribuFrontEnd.git
cd TribuFrontEnd
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crea un archivo `.env` basado en `.env.example`:
```
VITE_API_URL=http://localhost:8000/api
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizables
│   ├── common/     # Componentes comunes (Button, Input, etc.)
│   ├── layout/     # Componentes de layout (Header, Footer)
│   └── testimonials/ # Componentes de testimonios
├── contexts/        # Contextos de React
├── hooks/          # Custom hooks
├── pages/          # Páginas de la aplicación
│   ├── Admin/      # Panel administrativo
│   ├── Auth/       # Autenticación
│   ├── Booking/    # Sistema de reservas
│   ├── Home/       # Página principal
│   └── Services/   # Página de servicios
├── routes/         # Configuración de rutas
├── services/       # Servicios y API
│   └── api/       # Cliente API REST
├── types/          # Definiciones de TypeScript
└── utils/          # Utilidades y helpers
```

## Deployment en Vercel

Este proyecto está configurado para desplegarse automáticamente en Vercel.

### Variables de Entorno en Vercel

Configura las siguientes variables de entorno en tu proyecto de Vercel:

- `VITE_API_URL` - URL del backend Django en Render

### Deploy Manual

```bash
npm run build
vercel --prod
```

## Conexión con el Backend

El frontend se conecta al backend Django a través de una API REST. 

URL del backend: Se configura mediante la variable de entorno `VITE_API_URL`

## Credenciales de Prueba

Para el panel administrativo:
- Email: `admin@tribu.com`
- Contraseña: `admin123`

**Nota:** El sistema de autenticación actual es temporal. Se recomienda implementar autenticación completa con el backend Django para producción.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y propiedad de La Tribu.

## Contacto

Para consultas o soporte, contactar a través del repositorio de GitHub.

