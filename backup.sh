#!/bin/bash

# Script de backup para Trabamex
# Autor: Sistema de Backup Automático
# Fecha: $(date)

set -e

# Variables de configuración
APP_NAME="trabamex"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
DB_BACKUP_DIR="/var/backups/$APP_NAME/database"

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

# Crear directorios de backup si no existen
create_backup_dirs() {
    log "Creando directorios de backup..."
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $DB_BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR
    sudo chown -R $USER:$USER $LOG_DIR
}

# Backup de la aplicación
backup_application() {
    log "Iniciando backup de la aplicación..."
    
    BACKUP_NAME="$APP_NAME-app-$(date +'%Y%m%d-%H%M%S')"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    if [ -d "$APP_DIR/dist" ]; then
        log "Creando backup de archivos de la aplicación..."
        tar -czf "$BACKUP_PATH.tar.gz" -C "$APP_DIR" dist package.json package-lock.json
        
        # Crear archivo de información del backup
        cat > "$BACKUP_PATH.info" <<EOF
Backup creado: $(date)
Aplicación: $APP_NAME
Tipo: Aplicación
Archivo: $BACKUP_PATH.tar.gz
Tamaño: $(du -h "$BACKUP_PATH.tar.gz" | cut -f1)
EOF
        
        log "Backup de aplicación completado: $BACKUP_PATH.tar.gz"
    else
        warn "No se encontró el directorio dist. Saltando backup de aplicación."
    fi
}

# Backup de logs
backup_logs() {
    log "Iniciando backup de logs..."
    
    LOG_BACKUP_NAME="$APP_NAME-logs-$(date +'%Y%m%d-%H%M%S')"
    LOG_BACKUP_PATH="$BACKUP_DIR/$LOG_BACKUP_NAME"
    
    if [ -d "$LOG_DIR" ] && [ "$(ls -A $LOG_DIR)" ]; then
        log "Creando backup de logs..."
        tar -czf "$LOG_BACKUP_PATH.tar.gz" -C "$LOG_DIR" .
        
        # Crear archivo de información del backup
        cat > "$LOG_BACKUP_PATH.info" <<EOF
Backup creado: $(date)
Aplicación: $APP_NAME
Tipo: Logs
Archivo: $LOG_BACKUP_PATH.tar.gz
Tamaño: $(du -h "$LOG_BACKUP_PATH.tar.gz" | cut -f1)
EOF
        
        log "Backup de logs completado: $LOG_BACKUP_PATH.tar.gz"
    else
        warn "No se encontraron logs para hacer backup."
    fi
}

# Backup de configuración de Nginx
backup_nginx_config() {
    log "Iniciando backup de configuración de Nginx..."
    
    NGINX_BACKUP_NAME="$APP_NAME-nginx-$(date +'%Y%m%d-%H%M%S')"
    NGINX_BACKUP_PATH="$BACKUP_DIR/$NGINX_BACKUP_NAME"
    
    if [ -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        log "Creando backup de configuración de Nginx..."
        sudo cp "/etc/nginx/sites-available/$APP_NAME" "$NGINX_BACKUP_PATH.conf"
        sudo chown $USER:$USER "$NGINX_BACKUP_PATH.conf"
        
        # Crear archivo de información del backup
        cat > "$NGINX_BACKUP_PATH.info" <<EOF
Backup creado: $(date)
Aplicación: $APP_NAME
Tipo: Configuración Nginx
Archivo: $NGINX_BACKUP_PATH.conf
EOF
        
        log "Backup de configuración de Nginx completado: $NGINX_BACKUP_PATH.conf"
    else
        warn "No se encontró la configuración de Nginx para hacer backup."
    fi
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log "Limpiando backups antiguos..."
    
    # Mantener solo los últimos 7 días de backups
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "*.info" -mtime +7 -delete
    find $BACKUP_DIR -name "*.conf" -mtime +7 -delete
    
    log "Limpieza de backups antiguos completada"
}

# Crear reporte de backup
create_backup_report() {
    log "Creando reporte de backup..."
    
    REPORT_FILE="$BACKUP_DIR/backup-report-$(date +'%Y%m%d').txt"
    
    cat > "$REPORT_FILE" <<EOF
=== REPORTE DE BACKUP - $APP_NAME ===
Fecha: $(date)
Usuario: $USER
Servidor: $(hostname)

=== RESUMEN ===
- Aplicación: $APP_NAME
- Directorio de aplicación: $APP_DIR
- Directorio de backup: $BACKUP_DIR
- Logs: $LOG_DIR

=== BACKUPS CREADOS HOY ===
$(find $BACKUP_DIR -name "*$(date +'%Y%m%d')*" -type f | wc -l) archivos

=== ESPACIO UTILIZADO ===
$(du -sh $BACKUP_DIR)

=== BACKUPS DISPONIBLES ===
$(ls -la $BACKUP_DIR | grep "$(date +'%Y%m%d')" || echo "No hay backups de hoy")

=== FIN DEL REPORTE ===
EOF
    
    log "Reporte de backup creado: $REPORT_FILE"
}

# Función principal
main() {
    log "Iniciando proceso de backup para $APP_NAME..."
    
    create_backup_dirs
    backup_application
    backup_logs
    backup_nginx_config
    cleanup_old_backups
    create_backup_report
    
    log "Proceso de backup completado exitosamente!"
    log "Backups guardados en: $BACKUP_DIR"
}

# Ejecutar función principal
main "$@" 