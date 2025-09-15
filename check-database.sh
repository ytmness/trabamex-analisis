#!/bin/bash
echo "🔍 Verificando conexión a Supabase..."

# Verificar que las variables de entorno estén disponibles
echo "📋 Variables de entorno:"
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: $VITE_SUPABASE_ANON_KEY"

# Verificar conectividad
echo "🌐 Verificando conectividad..."
curl -s -o /dev/null -w "%{http_code}" https://zprdbdqqfndhohqzsuec.supabase.co/rest/v1/ || echo "Error de conectividad"

echo "✅ Verificación completada"
