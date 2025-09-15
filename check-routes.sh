#!/bin/bash

# Script para verificar y corregir rutas antes del despliegue
# Autor: Sistema de Verificación de Rutas
# Fecha: $(date)

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Función para verificar rutas problemáticas
check_problematic_paths() {
    log "Verificando rutas problemáticas..."
    
    # Buscar rutas relativas que podrían causar problemas
    PROBLEMATIC_FILES=()
    
    # Buscar archivos con rutas relativas problemáticas
    while IFS= read -r -d '' file; do
        if grep -q "from '\.\./" "$file" 2>/dev/null; then
            PROBLEMATIC_FILES+=("$file")
        fi
    done < <(find src -name "*.jsx" -o -name "*.js" -print0)
    
    if [ ${#PROBLEMATIC_FILES[@]} -gt 0 ]; then
        warn "Se encontraron archivos con rutas relativas que podrían causar problemas:"
        for file in "${PROBLEMATIC_FILES[@]}"; do
            echo "  - $file"
        done
    else
        log "No se encontraron rutas relativas problemáticas"
    fi
}

# Función para verificar que el alias @ esté configurado correctamente
check_alias_configuration() {
    log "Verificando configuración del alias @..."
    
    # Verificar que el alias esté en vite.config.js
    if grep -q "'@': path.resolve(__dirname, './src')" vite.config.js; then
        log "Alias @ configurado correctamente en vite.config.js"
    else
        error "Alias @ no encontrado en vite.config.js"
        return 1
    fi
    
    # Verificar que se use el alias en los archivos
    ALIAS_USAGE=$(grep -r "from '@/" src --include="*.jsx" --include="*.js" | wc -l)
    log "Se encontraron $ALIAS_USAGE usos del alias @"
}

# Función para verificar rutas de assets
check_asset_paths() {
    log "Verificando rutas de assets..."
    
    # Buscar referencias a assets que podrían fallar
    ASSET_PATHS=$(find src -name "*.jsx" -o -name "*.js" | xargs grep -l "\.\./assets\|\./assets" 2>/dev/null || true)
    
    if [ -n "$ASSET_PATHS" ]; then
        warn "Se encontraron referencias a assets con rutas relativas:"
        echo "$ASSET_PATHS"
    else
        log "No se encontraron rutas de assets problemáticas"
    fi
}

# Función para verificar configuración de base URL
check_base_url_config() {
    log "Verificando configuración de base URL..."
    
    # Verificar que exista el archivo .env.production
    if [ -f ".env.production" ]; then
        log "Archivo .env.production encontrado"
        
        # Verificar que tenga la configuración de API
        if grep -q "VITE_API_BASE_URL" .env.production; then
            API_URL=$(grep "VITE_API_BASE_URL" .env.production | cut -d'=' -f2)
            log "API Base URL configurada: $API_URL"
        else
            warn "VITE_API_BASE_URL no encontrada en .env.production"
        fi
    else
        warn "Archivo .env.production no encontrado"
    fi
}

# Función para verificar configuración de React Router
check_router_config() {
    log "Verificando configuración de React Router..."
    
    # Verificar que BrowserRouter esté configurado
    if grep -q "BrowserRouter" src/main.jsx; then
        log "BrowserRouter configurado correctamente"
    else
        error "BrowserRouter no encontrado en main.jsx"
        return 1
    fi
    
    # Verificar rutas principales
    MAIN_ROUTES=("/" "/login" "/register" "/mir")
    for route in "${MAIN_ROUTES[@]}"; do
        if grep -q "path=\"$route\"" src/App.jsx; then
            log "Ruta $route configurada correctamente"
        else
            warn "Ruta $route no encontrada en App.jsx"
        fi
    done
}

# Función para verificar dependencias críticas
check_critical_dependencies() {
    log "Verificando dependencias críticas..."
    
    CRITICAL_DEPS=("react" "react-dom" "react-router-dom" "@supabase/supabase-js")
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            log "Dependencia $dep encontrada en package.json"
        else
            error "Dependencia crítica $dep no encontrada en package.json"
            return 1
        fi
    done
}

# Función para crear archivo de configuración de rutas
create_route_config() {
    log "Creando archivo de configuración de rutas..."
    
    cat > src/lib/routeConfig.js <<EOF
// Configuración de rutas para producción
// Este archivo se genera automáticamente durante el despliegue

export const ROUTE_CONFIG = {
  // Rutas base
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CONTACT: '/contacto',
  
  // Rutas del dashboard
  DASHBOARD: '/mir',
  USER_DASHBOARD: '/mir/user',
  ADMIN_DASHBOARD: '/mir/admin',
  OPERATOR_DASHBOARD: '/mir/operator',
  
  // Rutas de usuario
  USER_SERVICES: '/mir/user/servicios',
  USER_REQUEST: '/mir/user/solicitar',
  USER_PLANS: '/mir/user/planes',
  USER_CHECKLIST: '/mir/user/checklist',
  USER_MANIFESTS: '/mir/user/manifiestos',
  USER_SUPPLIES: '/mir/user/solicitar-insumos',
  
  // Rutas de operador
  OPERATOR_ROUTE: '/mir/operator/route',
  OPERATOR_INCIDENT: '/mir/operator/incident/new',
  
  // Rutas de admin
  ADMIN_CLIENTS: '/mir/admin/clientes',
  ADMIN_OPERATORS: '/mir/admin/operadores',
  ADMIN_ORDERS: '/mir/admin/ordenes',
  ADMIN_ROUTES: '/mir/admin/rutas',
  ADMIN_PLANS: '/mir/admin/planes-admin',
  ADMIN_INCIDENTS: '/mir/admin/incidencias',
  ADMIN_TREATMENTS: '/mir/admin/tratamientos',
  ADMIN_CERTIFICATES: '/mir/admin/certificados',
  
  // API base URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173',
  
  // Configuración de Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Función para obtener la URL completa de una ruta
export const getFullUrl = (route) => {
  const baseUrl = ROUTE_CONFIG.API_BASE_URL;
  return \`\${baseUrl}\${route}\`;
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Función para obtener la URL base
export const getBaseUrl = () => {
  return ROUTE_CONFIG.API_BASE_URL;
};
EOF
    
    log "Archivo de configuración de rutas creado: src/lib/routeConfig.js"
}

# Función para verificar configuración de build
check_build_config() {
    log "Verificando configuración de build..."
    
    # Verificar que el directorio de salida esté configurado
    if grep -q "outDir: 'dist'" vite.config.js; then
        log "Directorio de salida configurado: dist"
    else
        warn "Directorio de salida no configurado en vite.config.js"
    fi
    
    # Verificar configuración de minificación
    if grep -q "minify: 'terser'" vite.config.js; then
        log "Minificación configurada: terser"
    else
        warn "Minificación no configurada"
    fi
    
    # Verificar configuración de chunks
    if grep -q "manualChunks" vite.config.js; then
        log "Configuración de chunks encontrada"
    else
        warn "Configuración de chunks no encontrada"
    fi
}

# Función para crear script de verificación post-build
create_post_build_check() {
    log "Creando script de verificación post-build..."
    
    cat > scripts/post-build-check.js <<EOF
#!/usr/bin/env node

// Script para verificar el build después de la compilación
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando build de producción...');

const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');

// Verificar que exista el directorio dist
if (!fs.existsSync(distPath)) {
    console.error('❌ Directorio dist no encontrado');
    process.exit(1);
}

// Verificar que exista index.html
if (!fs.existsSync(indexHtmlPath)) {
    console.error('❌ index.html no encontrado en dist');
    process.exit(1);
}

// Verificar que exista el directorio assets
const assetsPath = path.join(distPath, 'assets');
if (!fs.existsSync(assetsPath)) {
    console.error('❌ Directorio assets no encontrado');
    process.exit(1);
}

// Verificar archivos JS y CSS
const files = fs.readdirSync(assetsPath);
const jsFiles = files.filter(f => f.endsWith('.js'));
const cssFiles = files.filter(f => f.endsWith('.css'));

if (jsFiles.length === 0) {
    console.error('❌ No se encontraron archivos JS en assets');
    process.exit(1);
}

if (cssFiles.length === 0) {
    console.error('❌ No se encontraron archivos CSS en assets');
    process.exit(1);
}

console.log('✅ Build verificado correctamente');
console.log(\`📁 Archivos JS: \${jsFiles.length}\`);
console.log(\`📁 Archivos CSS: \${cssFiles.length}\`);
console.log(\`📄 Tamaño total: \${(fs.statSync(distPath).size / 1024 / 1024).toFixed(2)} MB\`);
EOF
    
    chmod +x scripts/post-build-check.js
    log "Script de verificación post-build creado: scripts/post-build-check.js"
}

# Función para actualizar package.json con scripts de verificación
update_package_scripts() {
    log "Actualizando scripts de package.json..."
    
    # Verificar si ya existen los scripts
    if ! grep -q "prebuild" package.json; then
        # Agregar script de prebuild
        sed -i '/"build":/i\    "prebuild": "node scripts/pre-build-check.js",' package.json
    fi
    
    if ! grep -q "postbuild" package.json; then
        # Agregar script de postbuild
        sed -i '/"build":/a\    "postbuild": "node scripts/post-build-check.js",' package.json
    fi
    
    log "Scripts de verificación agregados a package.json"
}

# Función principal
main() {
    log "Iniciando verificación de rutas para despliegue..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
        exit 1
    fi
    
    # Ejecutar verificaciones
    check_problematic_paths
    check_alias_configuration
    check_asset_paths
    check_base_url_config
    check_router_config
    check_critical_dependencies
    check_build_config
    
    # Crear archivos de configuración
    create_route_config
    create_post_build_check
    update_package_scripts
    
    log "Verificación de rutas completada exitosamente!"
    log "El proyecto está listo para el despliegue en el servidor."
}

# Ejecutar función principal
main "$@" 