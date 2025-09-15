#!/bin/bash

# Script para obtener la IP del servidor y configurar la aplicación
# Autor: Sistema de Configuración Automática
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

# Función para obtener la IP del servidor
get_server_ip() {
    log "Obteniendo IP del servidor..."
    
    # Intentar obtener IP pública
    PUBLIC_IP=$(curl -s --max-time 5 https://ipinfo.io/ip 2>/dev/null || echo "")
    
    # Obtener IP local
    LOCAL_IP=$(hostname -I | awk '{print $1}' | head -1)
    
    if [ -n "$PUBLIC_IP" ]; then
        SERVER_IP=$PUBLIC_IP
        log "IP pública detectada: $SERVER_IP"
    else
        SERVER_IP=$LOCAL_IP
        log "IP local detectada: $SERVER_IP"
    fi
    
    echo $SERVER_IP
}

# Función para configurar variables de entorno
configure_environment() {
    local SERVER_IP=$1
    
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

# Función para mostrar información del servidor
show_server_info() {
    local SERVER_IP=$1
    
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
    local SERVER_IP=$1
    
    log "Verificando conectividad..."
    
    # Verificar si el puerto 80 está abierto
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep ":80 " > /dev/null; then
            log "Puerto 80 está en uso"
        else
            warn "Puerto 80 no está en uso"
        fi
    fi
    
    # Verificar si Nginx está ejecutándose
    if systemctl is-active --quiet nginx; then
        log "Nginx está ejecutándose"
    else
        warn "Nginx no está ejecutándose"
    fi
    
    # Verificar firewall
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(sudo ufw status | grep "Status" | awk '{print $2}')
        log "Estado del firewall: $UFW_STATUS"
    fi
}

# Función principal
main() {
    log "Iniciando configuración automática del servidor..."
    
    # Verificar si estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
        exit 1
    fi
    
    # Obtener IP del servidor
    SERVER_IP=$(get_server_ip)
    
    if [ -z "$SERVER_IP" ]; then
        error "No se pudo obtener la IP del servidor"
        exit 1
    fi
    
    # Configurar variables de entorno
    configure_environment $SERVER_IP
    
    # Mostrar información del servidor
    show_server_info $SERVER_IP
    
    # Verificar conectividad
    check_connectivity $SERVER_IP
    
    log "Configuración completada exitosamente!"
    log "Ahora puedes ejecutar: ./deploy.sh"
}

# Ejecutar función principal
main "$@" 