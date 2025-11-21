#!/bin/bash

# Script de setup automático para el frontend de Tribu

echo "🚀 Iniciando setup del frontend de Tribu..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18 o superior."
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"
echo "✅ npm versión: $(npm --version)"

# Instalar dependencias
echo "📥 Instalando dependencias..."
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    echo "VITE_API_URL=http://localhost:8000/api" > .env
    echo "⚠️  Por favor, configura la URL del API en el archivo .env"
fi

echo ""
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Configurar VITE_API_URL en .env"
echo "2. Iniciar servidor de desarrollo: npm run dev"
echo "3. Construir para producción: npm run build"
echo ""

