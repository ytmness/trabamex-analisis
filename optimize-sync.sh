#!/bin/bash

# Script para limpiar archivos innecesarios antes de sincronización
# Autor: Optimización de Sincronización
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

# Función para mostrar estadísticas de archivos
show_file_stats() {
    log "=== ESTADÍSTICAS DE ARCHIVOS ==="
    
    TOTAL_FILES=$(find . -type f | wc -l)
    TOTAL_DIRS=$(find . -type d | wc -l)
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "No existe")
    DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "No existe")
    
    echo "Archivos totales: $TOTAL_FILES"
    echo "Directorios totales: $TOTAL_DIRS"
    echo "Tamaño de node_modules: $NODE_MODULES_SIZE"
    echo "Tamaño de dist: $DIST_SIZE"
    echo ""
}

# Función para limpiar archivos de desarrollo
clean_dev_files() {
    log "Limpiando archivos de desarrollo..."
    
    # Eliminar directorios de build
    if [ -d "dist" ]; then
        rm -rf dist
        log "Directorio dist eliminado"
    fi
    
    if [ -d "build" ]; then
        rm -rf build
        log "Directorio build eliminado"
    fi
    
    # Eliminar archivos de cache
    find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".vite" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".parcel-cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Eliminar archivos de log
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true
    find . -name "yarn-debug.log*" -type f -delete 2>/dev/null || true
    find . -name "yarn-error.log*" -type f -delete 2>/dev/null || true
    
    # Eliminar archivos temporales
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name "*.temp" -type f -delete 2>/dev/null || true
    find . -name "*~" -type f -delete 2>/dev/null || true
    
    # Eliminar archivos de backup
    find . -name "*.bak" -type f -delete 2>/dev/null || true
    find . -name "*.backup" -type f -delete 2>/dev/null || true
    find . -name "*.old" -type f -delete 2>/dev/null || true
    
    log "Archivos de desarrollo limpiados"
}

# Función para limpiar archivos del sistema operativo
clean_os_files() {
    log "Limpiando archivos del sistema operativo..."
    
    # Archivos de macOS
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "._*" -type f -delete 2>/dev/null || true
    find . -name ".Spotlight-V100" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".Trashes" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Archivos de Windows
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
    find . -name "ehthumbs.db" -type f -delete 2>/dev/null || true
    find . -name "Desktop.ini" -type f -delete 2>/dev/null || true
    
    # Archivos de Linux
    find . -name "*~" -type f -delete 2>/dev/null || true
    find . -name "*.swp" -type f -delete 2>/dev/null || true
    find . -name "*.swo" -type f -delete 2>/dev/null || true
    
    log "Archivos del sistema operativo limpiados"
}

# Función para limpiar archivos de IDE
clean_ide_files() {
    log "Limpiando archivos de IDE..."
    
    # Archivos de VS Code
    find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Archivos de IntelliJ/WebStorm
    find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.iml" -type f -delete 2>/dev/null || true
    
    # Archivos de Sublime Text
    find . -name "*.sublime-project" -type f -delete 2>/dev/null || true
    find . -name "*.sublime-workspace" -type f -delete 2>/dev/null || true
    
    # Archivos de Vim
    find . -name "*.swp" -type f -delete 2>/dev/null || true
    find . -name "*.swo" -type f -delete 2>/dev/null || true
    
    log "Archivos de IDE limpiados"
}

# Función para crear archivo de exclusión para Cyberduck
create_cyberduck_exclusions() {
    log "Creando archivo de exclusión para Cyberduck..."
    
    cat > .cyberduck-exclusions <<EOF
# Archivos y directorios a excluir de la sincronización con Cyberduck
# Este archivo puede ser usado para configurar exclusiones en Cyberduck

# Dependencias
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Builds de producción
dist/
build/

# Variables de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Archivos de IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Archivos del sistema operativo
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Cache
.cache/
.vite/
.parcel-cache/
.npm/

# Archivos temporales
tmp/
temp/
*.tmp
*.temp

# Archivos de backup
*.bak
*.backup
*.old

# Archivos de certificados
*.pem
*.key
*.crt

# Archivos comprimidos
*.zip
*.tar.gz
*.rar

# Archivos de base de datos
*.db
*.sqlite
*.sqlite3

# Archivos de PM2
.pm2/

# Archivos de TypeScript
*.tsbuildinfo
EOF
    
    log "Archivo .cyberduck-exclusions creado"
}

# Función para mostrar instrucciones de optimización
show_optimization_tips() {
    log "=== CONSEJOS DE OPTIMIZACIÓN PARA CYBERDUCK ==="
    echo ""
    echo "1. Configurar exclusiones en Cyberduck:"
    echo "   - Abrir Cyberduck"
    echo "   - Ir a Preferencias > Sincronización"
    echo "   - Agregar exclusiones basadas en .cyberduck-exclusions"
    echo ""
    echo "2. Sincronizar solo archivos necesarios:"
    echo "   - Excluir node_modules/ (se instala en el servidor)"
    echo "   - Excluir dist/ (se genera en el servidor)"
    echo "   - Excluir archivos de cache y temporales"
    echo ""
    echo "3. Usar sincronización incremental:"
    echo "   - Solo sincronizar archivos modificados"
    echo "   - Usar comparación de fechas de modificación"
    echo ""
    echo "4. Considerar usar Git en lugar de sincronización completa:"
    echo "   - Más eficiente para control de versiones"
    echo "   - Solo sincroniza cambios"
    echo ""
}

# Función para crear script de sincronización optimizada
create_sync_script() {
    log "Creando script de sincronización optimizada..."
    
    cat > sync-to-server.sh <<EOF
#!/bin/bash

# Script de sincronización optimizada para el servidor
# Autor: Sincronización Optimizada
# Fecha: $(date)

set -e

# Variables
SERVER_IP="144.202.72.150"
SERVER_USER="root"
SERVER_PATH="/var/www/trabamex"
LOCAL_PATH="."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "\${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] \$1\${NC}"
}

# Función para sincronizar solo archivos necesarios
sync_essential_files() {
    log "Sincronizando archivos esenciales..."
    
    # Crear lista de archivos a sincronizar
    rsync -avz --progress \\
        --exclude='node_modules/' \\
        --exclude='dist/' \\
        --exclude='build/' \\
        --exclude='.git/' \\
        --exclude='*.log' \\
        --exclude='.cache/' \\
        --exclude='.vite/' \\
        --exclude='.DS_Store' \\
        --exclude='Thumbs.db' \\
        --exclude='.vscode/' \\
        --exclude='.idea/' \\
        --exclude='*.tmp' \\
        --exclude='*.temp' \\
        --exclude='*.bak' \\
        --exclude='*.backup' \\
        \$LOCAL_PATH/ \$SERVER_USER@\$SERVER_IP:\$SERVER_PATH/
    
    log "Sincronización completada"
}

# Función para instalar dependencias en el servidor
install_dependencies() {
    log "Instalando dependencias en el servidor..."
    
    ssh \$SERVER_USER@\$SERVER_IP "cd \$SERVER_PATH && npm ci --production=false"
    
    log "Dependencias instaladas"
}

# Función para construir en el servidor
build_on_server() {
    log "Construyendo aplicación en el servidor..."
    
    ssh \$SERVER_USER@\$SERVER_IP "cd \$SERVER_PATH && NODE_ENV=production npm run build:prod"
    
    log "Aplicación construida"
}

# Función para reiniciar servicios
restart_services() {
    log "Reiniciando servicios..."
    
    ssh \$SERVER_USER@\$SERVER_IP "sudo systemctl reload apache2"
    
    log "Servicios reiniciados"
}

# Función principal
main() {
    log "Iniciando sincronización optimizada..."
    
    sync_essential_files
    install_dependencies
    build_on_server
    restart_services
    
    log "Sincronización y despliegue completados"
    log "Aplicación disponible en: http://\$SERVER_IP"
}

# Ejecutar función principal
main "\$@"
EOF
    
    chmod +x sync-to-server.sh
    log "Script sync-to-server.sh creado"
}

# Función principal
main() {
    log "Iniciando limpieza para optimizar sincronización..."
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
        exit 1
    fi
    
    # Mostrar estadísticas iniciales
    show_file_stats
    
    # Limpiar archivos
    clean_dev_files
    clean_os_files
    clean_ide_files
    
    # Crear archivos de optimización
    create_cyberduck_exclusions
    create_sync_script
    
    # Mostrar estadísticas finales
    log "=== ESTADÍSTICAS FINALES ==="
    show_file_stats
    
    # Mostrar consejos
    show_optimization_tips
    
    log "Limpieza completada exitosamente!"
    log "La sincronización ahora debería ser mucho más rápida."
}

# Ejecutar función principal
main "$@" 