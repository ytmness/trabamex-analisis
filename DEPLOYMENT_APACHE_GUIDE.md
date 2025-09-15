# 🚀 Guía de Despliegue - Trabamex con Apache
# Servidor: 144.202.72.150

Esta guía te ayudará a desplegar la aplicación Trabamex en tu servidor Apache usando la IP directa.

## 📋 Prerrequisitos

- Servidor Linux (Ubuntu 20.04+ recomendado)
- Acceso SSH con privilegios de sudo
- IP del servidor: 144.202.72.150
- Node.js 18+ y npm

## 🔐 Acceso al Servidor

```bash
ssh root@144.202.72.150
# Contraseña: {b5B5MU.+8xaSV,3
```

## 🛠️ Configuración Inicial del Servidor

### 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar dependencias básicas
```bash
sudo apt install -y curl wget git apache2 ufw
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
El archivo `env.production` ya está configurado con tu IP:
```bash
VITE_API_BASE_URL=http://144.202.72.150
```

### 3. Copiar configuración de entorno
```bash
cp env.production .env.production
```

## 🚀 Despliegue Automático

### Opción 1: Usar el script de despliegue para Apache (Recomendado)

1. **Hacer ejecutable el script:**
```bash
chmod +x deploy-apache.sh
```

2. **Ejecutar el despliegue:**
```bash
./deploy-apache.sh
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

#### 3. Configurar Apache
```bash
sudo cp apache.conf /etc/apache2/sites-available/trabamex.conf
sudo a2ensite trabamex
sudo a2dissite 000-default
sudo systemctl reload apache2
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

### Ver logs de Apache
```bash
sudo tail -f /var/log/apache2/trabamex_access.log
sudo tail -f /var/log/apache2/trabamex_error.log
```

### Ver logs de la aplicación (si usas PM2)
```bash
pm2 logs trabamex
```

### Verificar estado de servicios
```bash
sudo systemctl status apache2
pm2 status
```

## 🔄 Actualizaciones

### Actualizar la aplicación
```bash
cd /var/www/trabamex
git pull origin main
./deploy-apache.sh
```

### Actualizar dependencias
```bash
npm update
npm run build:prod
sudo systemctl reload apache2
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

### Error: Apache configuration
```bash
sudo apache2ctl configtest
sudo systemctl status apache2
```

### Error: "Cannot connect to server"
```bash
# Verificar que el puerto 80 esté abierto
sudo ufw status
# Verificar que Apache esté ejecutándose
sudo systemctl status apache2
# Verificar la configuración de red
ip addr show
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs: `/var/log/apache2/trabamex_error.log`
2. Verifica la configuración de Apache: `sudo apache2ctl configtest`
3. Verifica el estado de los servicios: `sudo systemctl status apache2`
4. Verifica la conectividad: `curl -I http://localhost`

## 📝 Notas Importantes

- **IP del Servidor**: 144.202.72.150
- **Puerto 80**: La aplicación se ejecuta en el puerto 80 (HTTP)
- **Apache**: Configurado con módulos rewrite, headers, expires y deflate
- **Backups**: Se crean automáticamente antes de cada despliegue
- **Logs**: Se guardan en `/var/log/apache2/` para facilitar el debugging

## 🌐 Acceso a la Aplicación

Una vez desplegada, tu aplicación estará disponible en:
```
http://144.202.72.150
```

---

**¡Tu aplicación Trabamex debería estar funcionando en http://144.202.72.150!** 🎉 