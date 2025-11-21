# Guía de Deployment - Tribu Frontend

## Deployment en Vercel

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los archivos estén comiteados:
```bash
git add .
git commit -m "Frontend React listo para deployment"
git push origin main
```

### Paso 2: Conectar con Vercel

#### Opción A: Desde la Web de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Clic en "Add New..." → "Project"
3. Import tu repositorio: `https://github.com/pks1312/TribuFrontEnd`
4. Configuración automática (Vercel detectará Vite)

#### Opción B: Desde la CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Paso 3: Configuración del Proyecto

Vercel detectará automáticamente que es un proyecto Vite. Configuración sugerida:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Paso 4: Variables de Entorno

En "Settings" → "Environment Variables", agregar:

```bash
VITE_API_URL=https://tribu-backend.onrender.com/api
```

**Notas importantes:**
- Las variables deben comenzar con `VITE_`
- Usa la URL completa del backend desplegado en Render
- Configura para "Production", "Preview" y "Development"

### Paso 5: Deploy

1. Clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. El proceso toma ~2-3 minutos

### Paso 6: Verificar Deployment

1. Vercel te dará una URL: `https://tribu-theta.vercel.app`
2. Visita la URL y verifica que todo funcione
3. Prueba crear una reserva para verificar la conexión con el backend

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. En Settings → Domains
2. Agregar tu dominio personalizado
3. Seguir instrucciones para configurar DNS

## Actualizaciones Automáticas

Vercel está configurado para deployment automático:

- **Push a `main`**: Deploy a producción
- **Push a otras ramas**: Deploy de preview
- **Pull Requests**: Deploy de preview automático

### Actualizar la Aplicación

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel detectará los cambios y desplegará automáticamente en ~2 minutos.

## Configuración Avanzada

### Redirecciones y Rewrites

El archivo `vercel.json` ya está configurado con:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esto permite que las rutas de React Router funcionen correctamente.

### Headers de Seguridad

Para agregar headers de seguridad, modifica `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Monitoreo

### Ver Logs

1. En el dashboard de Vercel, ve a tu proyecto
2. Clic en "Deployments"
3. Selecciona un deployment y ve los logs

### Analytics

Vercel ofrece analytics gratuito:
1. Ve a tu proyecto en Vercel
2. Clic en "Analytics"
3. Ver métricas de performance y tráfico

## Rollback

Si algo sale mal:

1. Ve a "Deployments"
2. Encuentra el deployment anterior que funcionaba
3. Clic en "..." → "Promote to Production"

## Performance

### Optimización de Build

El proyecto ya está optimizado, pero puedes mejorar:

1. **Code Splitting**: Ya implementado con React.lazy()
2. **Compresión**: Vercel comprime automáticamente
3. **CDN**: Vercel usa CDN global automáticamente
4. **Cache**: Headers de cache configurados automáticamente

### Lighthouse Score

Ejecuta auditorías con Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://tribu-theta.vercel.app
```

## Troubleshooting

### Build Fails

**Error: "Command failed"**
- Verifica que el build funcione localmente: `npm run build`
- Revisa los logs en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

**Error: TypeScript**
- Ejecuta `npm run lint` localmente
- Corrige errores de tipos antes de pushear

### Runtime Errors

**Error: "Cannot connect to API"**
- Verifica que `VITE_API_URL` esté configurada
- Asegúrate de que el backend esté funcionando
- Verifica CORS en el backend

**Error: 404 en rutas**
- Verifica que `vercel.json` tenga las rewrites configuradas
- Comprueba que las rutas en React Router coincidan

### Environment Variables

**Variables no se aplican**
- Vercel necesita rebuild después de cambiar variables
- Redeploy desde el dashboard o push nuevo commit

## Seguridad

✅ **Mejores Prácticas**:
- No expongas API keys en el código
- Usa variables de entorno para URLs
- Mantén dependencias actualizadas
- Revisa alertas de seguridad de GitHub

⚠️ **IMPORTANTE**:
- Nunca subas archivos `.env` al repositorio
- Las variables `VITE_` son públicas (incluidas en el bundle)
- No pongas secrets en variables `VITE_`

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

