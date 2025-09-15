# 🚀 Guía de Despliegue - Trabamex (IP Directa)

Esta guía te ayudará a desplegar la aplicación Trabamex en tu servidor Linux usando la IP directa del servidor.

## 📋 Prerrequisitos

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Acceso SSH con privilegios de sudo
- IP del servidor configurada y accesible
- Node.js 18+ y npm

## 🛠️ Configuración Inicial del Servidor

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar dependencias básicas
```bash
sudo apt install -y curl wget git nginx ufw
```

### 3. Configurar firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw --force enable
```

## 📁 Preparación del Proyecto

### 1. Clonar el proyecto
```bash
cd /var/www
sudo git clone https://github.com/tu-usuario/trabamex.git
sudo chown -R $USER:$USER trabamex
cd trabamex
```

### 2. Configurar variables de entorno
Edita el archivo `env.production` y actualiza la IP de tu servidor:

```bash
# Reemplaza TU_IP_DEL_SERVIDOR con tu IP real (ejemplo: 192.168.1.100)
VITE_API_BASE_URL=http://TU_IP_DEL_SERVIDOR

# Configuración de EmailJS (si usas)
VITE_EMAILJS_PUBLIC_KEY=tu_emailjs_public_key_real
VITE_EMAILJS_SERVICE_ID=tu_emailjs_service_id_real
VITE_EMAILJS_TEMPLATE_ID=tu_emailjs_template_id_real
```

### 3. Copiar configuración de entorno
```bash
cp env.production .env.production
```

## 🚀 Despliegue Automático

### Opción 1: Usar el script de despliegue (Recomendado)

1. **Hacer ejecutable el script:**
```bash
chmod +x deploy.sh
```

2. **Editar el script para tu IP:**
```bash
nano deploy.sh
```
Cambia `TU_IP_DEL_SERVIDOR` por tu IP real en la línea:
- `log "La aplicación está disponible en: http://TU_IP_DEL_SERVIDOR"`

3. **Ejecutar el despliegue:**
```bash
./deploy.sh
```

### Opción 2: Despliegue Manual

#### 1. Instalar dependencias
```bash
npm ci --production=false
```

#### 2. Construir para producción
```bash
NODE_ENV=production npm run build:prod
```

#### 3. Configurar Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/trabamex
sudo ln -s /etc/nginx/sites-available/trabamex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Configuración Adicional

### Configurar PM2 (Opcional - para desarrollo)
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Configurar backups automáticos
```bash
sudo crontab -e
# Agregar esta línea para backups diarios:
0 2 * * * /var/www/trabamex/backup.sh
```

## 📊 Monitoreo y Logs

### Ver logs de Nginx
```bash
sudo tail -f /var/log/nginx/trabamex_access.log
sudo tail -f /var/log/nginx/trabamex_error.log
```

### Ver logs de la aplicación (si usas PM2)
```bash
pm2 logs trabamex
```

### Verificar estado de servicios
```bash
sudo systemctl status nginx
pm2 status
```

## 🔄 Actualizaciones

### Actualizar la aplicación
```bash
cd /var/www/trabamex
git pull origin main
./deploy.sh
```

### Actualizar dependencias
```bash
npm update
npm run build:prod
sudo systemctl reload nginx
```

## 🛡️ Seguridad

### Configuraciones recomendadas adicionales:

1. **Configurar fail2ban:**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

2. **Configurar actualizaciones automáticas:**
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

3. **Configurar respaldos automáticos:**
```bash
sudo apt install rsync
# Crear script de backup personalizado
```

## 🚨 Solución de Problemas

### Error: "Permission denied"
```bash
sudo chown -R $USER:$USER /var/www/trabamex
```

### Error: "Port already in use"
```bash
sudo netstat -tulpn | grep :80
```

### Error: Nginx configuration
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Error: "Cannot connect to server"
```bash
# Verificar que el puerto 80 esté abierto
sudo ufw status
# Verificar que Nginx esté ejecutándose
sudo systemctl status nginx
# Verificar la configuración de red
ip addr show
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs: `/var/log/nginx/trabamex_error.log`
2. Verifica la configuración de Nginx: `sudo nginx -t`
3. Verifica el estado de los servicios: `sudo systemctl status nginx`
4. Verifica la conectividad: `curl -I http://localhost`

## 📝 Notas Importantes

- **IP del Servidor**: Asegúrate de que la IP esté configurada correctamente y sea accesible desde la red
- **Puerto 80**: La aplicación se ejecuta en el puerto 80 (HTTP)
- **Backups**: Se crean automáticamente antes de cada despliegue
- **Logs**: Se guardan en `/var/log/trabamex/` para facilitar el debugging

## 🌐 Acceso a la Aplicación

Una vez desplegada, tu aplicación estará disponible en:
```
http://TU_IP_DEL_SERVIDOR
```

Ejemplo: `http://192.168.1.100`

---

**¡Tu aplicación Trabamex debería estar funcionando en http://TU_IP_DEL_SERVIDOR!** 🎉 