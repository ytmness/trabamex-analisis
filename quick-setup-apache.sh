#!/bin/bash

# Script de configuración rápida para servidor Apache
# Servidor: 144.202.72.150
# Autor: Configuración Rápida
# Fecha: $(date)

set -e

# Variables de configuración
APP_NAME="trabamex"
APP_DIR="/var/www/$APP_NAME"
SERVER_IP="144.202.72.150"

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

# Función para mostrar información del servidor
show_server_info() {
    log "=== INFORMACIÓN DEL SERVIDOR ==="
    echo "Hostname: $(hostname)"
    echo "IP del servidor: $SERVER_IP"
    echo "Sistema operativo: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Arquitectura: $(uname -m)"
    echo "Memoria RAM: $(free -h | grep Mem | awk '{print $2}')"
    echo "Espacio en disco: $(df -h / | tail -1 | awk '{print $4}') disponible"
    echo ""
    log "La aplicación estará disponible en: http://$SERVER_IP"
}

# Función para verificar conectividad
check_connectivity() {
    log "Verificando conectividad..."
    
    # Verificar si el puerto 80 está abierto
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep ":80 " > /dev/null; then
            log "Puerto 80 está en uso"
        else
            warn "Puerto 80 no está en uso"
        fi
    fi
    
    # Verificar si Apache está ejecutándose
    if systemctl is-active --quiet apache2; then
        log "Apache está ejecutándose"
    else
        warn "Apache no está ejecutándose"
    fi
    
    # Verificar firewall
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(sudo ufw status | grep "Status" | awk '{print $2}')
        log "Estado del firewall: $UFW_STATUS"
    fi
}

# Función para configurar variables de entorno
configure_environment() {
    log "Configurando variables de entorno con IP: $SERVER_IP"
    
    # Crear archivo .env.production
    cat > .env.production <<EOF
# Configuración de producción para servidor Linux
VITE_SUPABASE_URL=https://zprdbdqqfndhohqzsuec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcmRiZHFxZm5kaG9ocXpzdWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUyMzYsImV4cCI6MjA3MDg2MTIzNn0.B-bs7NiYKNXWMeRoA-K4_5Z9lHjAE-A6MxW5Ygf764M

# Configuración del servidor
VITE_API_BASE_URL=http://$SERVER_IP
VITE_APP_ENV=production

# Configuración de EmailJS (si se usa)
VITE_EMAILJS_PUBLIC_KEY=tu_emailjs_public_key
VITE_EMAILJS_SERVICE_ID=tu_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_emailjs_template_id
EOF
    
    log "Archivo .env.production creado con IP: $SERVER_IP"
}

# Función para verificar configuración de Apache
check_apache_config() {
    log "Verificando configuración de Apache..."
    
    # Verificar que Apache esté instalado
    if command -v apache2 &> /dev/null; then
        log "Apache está instalado"
        
        # Verificar módulos necesarios
        MODULES=("rewrite" "headers" "expires" "deflate")
        for module in "${MODULES[@]}"; do
            if apache2ctl -M | grep -q "$module"; then
                log "Módulo $module habilitado"
            else
                warn "Módulo $module no habilitado"
            fi
        done
        
        # Verificar configuración
        if sudo apache2ctl configtest 2>/dev/null; then
            log "Configuración de Apache válida"
        else
            error "Configuración de Apache inválida"
        fi
    else
        warn "Apache no está instalado"
    fi
}

# Función para crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p /var/backups/$APP_NAME
    sudo mkdir -p /var/log/$APP_NAME
    
    # Cambiar permisos
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER /var/backups/$APP_NAME
    sudo chown -R $USER:$USER /var/log/$APP_NAME
    
    log "Directorios creados exitosamente"
}

# Función para hacer ejecutables los scripts
make_scripts_executable() {
    log "Haciendo ejecutables los scripts..."
    
    chmod +x deploy-apache.sh 2>/dev/null || warn "deploy-apache.sh no encontrado"
    chmod +x check-routes.sh 2>/dev/null || warn "check-routes.sh no encontrado"
    chmod +x backup.sh 2>/dev/null || warn "backup.sh no encontrado"
    
    log "Scripts hechos ejecutables"
}

# Función principal
main() {
    log "Iniciando configuración rápida para $APP_NAME..."
    log "Servidor: $SERVER_IP"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
        exit 1
    fi
    
    # Ejecutar configuraciones
    show_server_info
    check_connectivity
    configure_environment
    check_apache_config
    create_directories
    make_scripts_executable
    
    log "Configuración rápida completada exitosamente!"
    log "Ahora puedes ejecutar: ./deploy-apache.sh"
    log "La aplicación estará disponible en: http://$SERVER_IP"
}

# Ejecutar función principal
main "$@" 