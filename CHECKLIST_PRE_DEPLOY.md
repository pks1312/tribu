# ✅ Checklist Pre-Deploy - Frontend

Verifica cada item ANTES de hacer deploy a Vercel.

## 📋 Configuración

- [ ] Archivo `.env.example` existe
- [ ] Archivo `.gitignore` incluye `.env`, `node_modules/`, `dist/`
- [ ] `package.json` NO tiene dependencia de Firebase
- [ ] `package.json` incluye `axios`
- [ ] Variables de entorno usan prefijo `VITE_`

## 🔥 Firebase Removido

- [ ] No hay archivos `firebase*` en el proyecto
- [ ] Carpeta `src/services/firebase/` eliminada
- [ ] No hay imports de `firebase` en el código
- [ ] `AuthContext` NO usa Firebase
- [ ] No hay `firestore.rules` ni `firestore.indexes.json`

## 🌐 APIs Actualizadas

- [ ] Archivo `src/services/api/config.ts` existe
- [ ] Cliente Axios configurado con `baseURL` desde env
- [ ] 8 clientes API creados (services, professionals, etc.)
- [ ] Todas las APIs exportadas en `index.ts`
- [ ] Interceptors de Axios configurados

## 🎣 Custom Hooks

- [ ] `useServices.ts` implementado
- [ ] `useProfessionals.ts` implementado
- [ ] `useSchedule.ts` implementado
- [ ] `useBookings.ts` implementado
- [ ] `useTestimonials.ts` implementado
- [ ] `useGallery.ts` implementado
- [ ] `useAuth.ts` implementado
- [ ] Todos los hooks manejan loading y errors

## 🧪 Testing Local

- [ ] `npm install` ejecuta sin errores
- [ ] `npm run dev` inicia sin errores
- [ ] Aplicación carga en `http://localhost:5173`
- [ ] No hay errores en consola del navegador
- [ ] Conexión con backend local funciona
- [ ] Build funciona: `npm run build`
- [ ] Preview funciona: `npm run preview`

## 📦 Build

- [ ] `vite.config.ts` configurado correctamente
- [ ] Build genera carpeta `dist/`
- [ ] Archivos en `dist/` son válidos
- [ ] No hay warnings críticos en build
- [ ] Tamaño del bundle es razonable

## 🔗 Rutas

- [ ] `vercel.json` existe con rewrites configuradas
- [ ] React Router funciona correctamente
- [ ] Rutas protegidas funcionan
- [ ] 404 page configurada
- [ ] Navegación funciona en build

## 🎨 UI/UX

- [ ] Todas las páginas cargan correctamente
- [ ] Responsive design funciona (móvil, tablet, desktop)
- [ ] Imágenes cargan correctamente
- [ ] Modo claro/oscuro funciona
- [ ] Animaciones funcionan
- [ ] Formularios validan correctamente

## 📝 TypeScript

- [ ] No hay errores de TypeScript: `npm run build`
- [ ] Tipos correctamente definidos
- [ ] No hay `any` innecesarios
- [ ] Interfaces exportadas correctamente

## 🔐 Seguridad

- [ ] No hay API keys en el código
- [ ] No hay archivos `.env` en el repo
- [ ] URLs de API vienen de variables de entorno
- [ ] No hay credenciales hardcodeadas

## 📊 Performance

- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado donde es apropiado
- [ ] Code splitting funciona
- [ ] Sin dependencias innecesarias
- [ ] Bundle size analizado

## 🌐 Variables de Entorno para Vercel

Preparar este valor:

```bash
VITE_API_URL=https://tribu-backend.onrender.com/api
```

**IMPORTANTE:** Debe apuntar al backend deployado en Render

## 🚀 Git

- [ ] `.gitignore` configurado correctamente
- [ ] Commit inicial hecho
- [ ] Mensajes de commit descriptivos
- [ ] Branch `main` configurado
- [ ] No hay archivos sensibles en el repo
- [ ] No hay `node_modules/` ni `dist/` en el repo

## 📱 Compatibilidad

- [ ] Probado en Chrome
- [ ] Probado en Firefox
- [ ] Probado en Safari (si es posible)
- [ ] Probado en Edge
- [ ] Responsive design verificado

## 🔍 Integración con Backend

- [ ] URLs de API correctas
- [ ] Formato de request correcto
- [ ] Manejo de errores implementado
- [ ] Loading states implementados
- [ ] CORS funciona

## ✅ Comando Final de Verificación

```bash
# Ejecutar TODOS estos comandos sin errores
npm run lint
npm run build
npm run preview
# Probar todas las funcionalidades en preview
```

## 📞 Si Todo Está ✅

Estás listo para:
1. Hacer push a GitHub
2. Importar repo en Vercel
3. Configurar variable `VITE_API_URL`
4. Deploy automático!

---

**Fecha de verificación:** _____________

**Verificado por:** _____________

**Notas adicionales:**

**Backend URL:** _____________

**Expected Vercel URL:** https://tribu-theta.vercel.app

