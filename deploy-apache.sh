#!/bin/bash

# Script de despliegue para Trabamex en servidor Apache
# Autor: Sistema de Despliegue Automático
# Fecha: $(date)
# Servidor: 144.202.72.150

set -e  # Salir si hay algún error

# Variables de configuración
APP_NAME="trabamex"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
APACHE_CONF="/etc/apache2/sites-available/$APP_NAME.conf"
APACHE_ENABLED="/etc/apache2/sites-enabled/$APP_NAME.conf"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Función para crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    
    # Cambiar permisos
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR
    sudo chown -R $USER:$USER $LOG_DIR
    
    log "Directorios creados exitosamente"
}

# Función para hacer backup
backup_current() {
    if [ -d "$APP_DIR/dist" ]; then
        log "Haciendo backup de la versión actual..."
        BACKUP_NAME="$APP_NAME-$(date +'%Y%m%d-%H%M%S')"
        sudo cp -r $APP_DIR/dist $BACKUP_DIR/$BACKUP_NAME
        log "Backup guardado en $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Función para verificar rutas antes del despliegue
verify_routes() {
    log "Verificando rutas antes del despliegue..."
    
    # Ejecutar script de verificación de rutas
    if [ -f "check-routes.sh" ]; then
        chmod +x check-routes.sh
        ./check-routes.sh
    else
        warn "Script de verificación de rutas no encontrado"
    fi
}

# Función para instalar dependencias
install_dependencies() {
    log "Instalando dependencias..."
    
    # Verificar si Node.js está instalado
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado. Instalando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Verificar si npm está instalado
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado. Instalando..."
        sudo apt-get install -y npm
    fi
    
    # Instalar dependencias del proyecto
    npm ci --production=false
    
    log "Dependencias instaladas exitosamente"
}

# Función para construir la aplicación
build_application() {
    log "Construyendo la aplicación para producción..."
    
    # Establecer variables de entorno para producción
    export NODE_ENV=production
    
    # Verificar rutas antes del build
    verify_routes
    
    # Construir la aplicación
    npm run build:prod
    
    # Verificar que el build se completó correctamente
    if [ ! -d "dist" ]; then
        error "El directorio dist no se creó. El build falló."
        exit 1
    fi
    
    log "Aplicación construida exitosamente"
}

# Función para configurar Apache
setup_apache() {
    log "Configurando Apache..."
    
    # Instalar Apache si no está instalado
    if ! command -v apache2 &> /dev/null; then
        log "Apache no está instalado. Instalando..."
        sudo apt-get update
        sudo apt-get install -y apache2
    fi
    
    # Habilitar módulos necesarios
    sudo a2enmod rewrite
    sudo a2enmod headers
    sudo a2enmod expires
    sudo a2enmod deflate
    
    # Crear configuración de Apache
    sudo tee $APACHE_CONF > /dev/null <<EOF
# Configuración de Apache para Trabamex
# Archivo: /etc/apache2/sites-available/trabamex.conf

<VirtualHost *:80>
    ServerName 144.202.72.150
    ServerAdmin webmaster@144.202.72.150
    
    # Directorio raíz de la aplicación
    DocumentRoot $APP_DIR/dist
    
    # Configuración del directorio
    <Directory $APP_DIR/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Configuración para SPA (Single Page Application)
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html\$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Configuración de gzip para mejor rendimiento
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain
        AddOutputFilterByType DEFLATE text/html
        AddOutputFilterByType DEFLATE text/xml
        AddOutputFilterByType DEFLATE text/css
        AddOutputFilterByType DEFLATE application/xml
        AddOutputFilterByType DEFLATE application/xhtml+xml
        AddOutputFilterByType DEFLATE application/rss+xml
        AddOutputFilterByType DEFLATE application/javascript
        AddOutputFilterByType DEFLATE application/x-javascript
        AddOutputFilterByType DEFLATE application/json
    </IfModule>
    
    # Headers de seguridad
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"
    
    # Configuración de cache para archivos estáticos
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
        ExpiresByType application/font-woff "access plus 1 year"
        ExpiresByType application/font-woff2 "access plus 1 year"
    </IfModule>
    
    # Configuración de logs
    ErrorLog \${APACHE_LOG_DIR}/trabamex_error.log
    CustomLog \${APACHE_LOG_DIR}/trabamex_access.log combined
</VirtualHost>
EOF
    
    # Habilitar el sitio
    sudo a2ensite $APP_NAME
    
    # Deshabilitar sitio por defecto si existe
    if [ -f "/etc/apache2/sites-enabled/000-default.conf" ]; then
        sudo a2dissite 000-default
    fi
    
    # Verificar configuración de Apache
    sudo apache2ctl configtest
    
    # Recargar Apache
    sudo systemctl reload apache2
    
    log "Apache configurado exitosamente"
}

# Función para configurar PM2 (opcional, para desarrollo)
setup_pm2() {
    log "Configurando PM2 para desarrollo..."
    
    # Verificar si PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        warn "PM2 no está instalado. Instalando..."
        sudo npm install -g pm2
    fi
    
    # Crear archivo de configuración de PM2
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'run start:prod',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    }
  }]
};
EOF
    
    log "PM2 configurado exitosamente"
}

# Función para configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # Verificar si ufw está instalado
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw --force enable
        log "Firewall configurado exitosamente"
    else
        warn "ufw no está instalado. Saltando configuración de firewall."
    fi
}

# Función para limpiar archivos temporales
cleanup() {
    log "Limpiando archivos temporales..."
    
    # Eliminar archivos de node_modules si no se necesitan en producción
    if [ "$NODE_ENV" = "production" ]; then
        rm -rf node_modules
    fi
    
    # Limpiar cache de npm
    npm cache clean --force
    
    log "Limpieza completada"
}

# Función para verificar el despliegue
verify_deployment() {
    log "Verificando el despliegue..."
    
    # Verificar que Apache esté ejecutándose
    if systemctl is-active --quiet apache2; then
        log "Apache está ejecutándose correctamente"
    else
        error "Apache no está ejecutándose"
        return 1
    fi
    
    # Verificar que el directorio dist exista
    if [ -d "$APP_DIR/dist" ]; then
        log "Archivos de la aplicación desplegados correctamente"
    else
        error "Archivos de la aplicación no encontrados"
        return 1
    fi
    
    # Verificar que index.html exista
    if [ -f "$APP_DIR/dist/index.html" ]; then
        log "index.html encontrado"
    else
        error "index.html no encontrado"
        return 1
    fi
    
    # Verificar que el sitio esté habilitado
    if [ -L "$APACHE_ENABLED" ]; then
        log "Sitio de Apache habilitado correctamente"
    else
        error "Sitio de Apache no está habilitado"
        return 1
    fi
    
    log "Despliegue verificado exitosamente"
}

# Función principal
main() {
    log "Iniciando despliegue de $APP_NAME en Apache..."
    log "Servidor: 144.202.72.150"
    
    # Verificar si estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        error "No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
        exit 1
    fi
    
    # Ejecutar pasos de despliegue
    create_directories
    backup_current
    install_dependencies
    build_application
    setup_apache
    setup_pm2
    setup_firewall
    cleanup
    verify_deployment
    
    log "Despliegue completado exitosamente!"
    log "La aplicación está disponible en: http://144.202.72.150"
    log "Logs disponibles en: $LOG_DIR"
}

# Ejecutar función principal
main "$@" 