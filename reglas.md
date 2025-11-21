Estructuras
project-root/
│
├── public/                 # Archivos estáticos públicos
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── assets/            # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   ├── fonts/
│   │   └── styles/
│   │       ├── global/
│   │       ├── themes/
│   │       └── variables.scss
│   │
│   ├── components/        # Componentes reutilizables
│   │   ├── common/        # Componentes UI genéricos
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   └── Input/
│   │   ├── forms/         # Componentes de formulario
│   │   └── layout/        # Componentes de layout
│   │
│   ├── hooks/             # Custom hooks
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   └── useLocalStorage.js
│   │
│   ├── services/          # Llamadas a APIs y servicios externos
│   │   ├── api/
│   │   │   ├── baseAPI.js
│   │   │   ├── authAPI.js
│   │   │   └── userAPI.js
│   │   ├── storage/
│   │   └── utils/
│   │
│   ├── store/             # Estado global (Redux/Zustand)
│   │   ├── slices/
│   │   ├── actions/
│   │   └── index.js
│   │
│   ├── contexts/          # React Contexts
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   │
│   ├── pages/             # Componentes de página/ruta
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   └── Profile/
│   │
│   ├── utils/             # Utilidades y helpers
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   │
│   ├── routes/            # Configuración de rutas
│   │   └── AppRouter.js
│   │
│   ├── types/             # Tipos TypeScript/PropTypes
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
│
├── tests/                 # Tests de integración
│   ├── unit/
│   └── integration/
│
├── docs/                  # Documentación
├── scripts/               # Scripts de construcción/despliegue
├── .env.example           # Variables de entorno de ejemplo
├── package.json
├── README.md
└── vite.config.js         # Configuración de Vite

Organizacion de Imports
// 1. React y librerías externas
import React from 'react';
import { useSelector } from 'react-redux';

// 2. Importaciones absolutas (@/)
import { Button } from '@/components/common';
import { userAPI } from '@/services/api';

// 3. Importaciones relativas
import UserCard from './UserCard';
import styles from './UserProfile.module.css';

Servicios y api 
// services/api/userAPI.js
export const userAPI = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

Custom Hooks
// hooks/useApi.js
const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Implementación del hook...
  
  return { data, loading, error };
};

Estructura de estado global
// store/slices/userSlice.js
const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    // ... más reducers
  }
});

No poner emojis en el codigo ni en sus comentarios porfavor

Todas estas reglas son para mantener el codigo organizado legible y mantenible

en el formulario para dejar un comentario, sacar la profesion es mas que nada para que la gente normal nos recomiende, que no pida ni nombre solamente los que tienen cuenta pueden ver esto, y el formulario deberia ser comentario, calificacion y los botones para publicar el comentario, ojo estos deben ser revisados pero no lo pondremos explicito si no que de forma interna, ¿porque deben ser revisados? porque asi nos ahorramos publicidad de la competencia, cuando finalicemos la pagina tendremos un crud completo donde el administrador podra el añadir mas servicios, profesionales, borrar, editar, agregar galeria, todo lo de la pagina, ademas tendra un panel con el trabajador donde podran marcan las horas canceladas, las horas, marcar si se realizo el trabajo o no, y esto les ira dando estadistica en tiempo real y tambien al final del dia osea, mi idea es que la informacion este a toda hora 

Ademas recuerda que el front end va en el vercel y el back o la bd es de firebase

SISTEMA DE RESERVAS (/booking):
- Flujo: Seleccionar Barbero -> Seleccionar Servicio (filtrado por barbero) -> Seleccionar Fecha -> Seleccionar Hora -> Confirmar
- Cada barbero tiene servicios específicos asignados por el administrador
- No todos los barberos realizan todos los servicios
- Al confirmar se envía confirmación automática por WhatsApp y correo electrónico
- Los servicios disponibles se filtran según el barbero seleccionado

PANEL DE ADMINISTRADOR:
- Dashboard con estadísticas en tiempo real (actualización cada 30 segundos)
- CRUD completo de servicios (crear, leer, actualizar, eliminar)
- CRUD completo de profesionales/barberos (crear, leer, actualizar, eliminar)
- CRUD completo de galería (crear, leer, actualizar, eliminar, subir imágenes)
- Gestión de reservas (ver, confirmar, completar, cancelar)
- Asignación de servicios específicos a cada barbero
- Gestión de horarios disponibles por barbero
- Estadísticas de ingresos, servicios más solicitados, rendimiento por barbero
- Aprobación de testimonios (para evitar publicidad de competencia)

PANEL DE TRABAJADOR:
- Ver reservas asignadas
- Marcar horas como canceladas
- Marcar servicios como completados
- Estadísticas personales en tiempo real
- Resumen diario de trabajo

DISEÑO UI/UX:
- Mantener coherencia visual con la landing page
- Colores: mint green (#A8E6CF, #7FD3B0) y teal (#4ECDC4)
- Tipografía: Playfair Display para títulos, Lato para cuerpo
- Animaciones suaves y transiciones fluidas
- Diseño limpio, profesional y moderno
- Cards con bordes sutiles y sombras ligeras
- Responsive para todos los dispositivos

quiero eliminar todo lo que tenga que ver con firebase de este proyecto, quiero crear el back end en django y que sea una api, el back end que este en un modulo diferente porque lo hostearemos en render y el front lo desplegaremos en vercel 