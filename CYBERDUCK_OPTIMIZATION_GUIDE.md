# 🚀 Guía de Optimización de Sincronización - Cyberduck

Esta guía te ayudará a optimizar la sincronización con Cyberduck para que sea mucho más rápida.

## ⚡ Problema Identificado

La sincronización lleva 30 minutos porque está subiendo archivos innecesarios como:
- `node_modules/` (miles de archivos)
- `dist/` (archivos de build)
- Archivos de cache y temporales
- Archivos del sistema operativo

## 🛠️ Solución: Limpieza y Optimización

### 1. Ejecutar Script de Limpieza

```bash
# En tu máquina local (antes de sincronizar)
chmod +x optimize-sync.sh
./optimize-sync.sh
```

Este script:
- ✅ Elimina archivos innecesarios
- ✅ Limpia cache y temporales
- ✅ Crea archivo de exclusiones para Cyberduck
- ✅ Genera estadísticas de archivos

### 2. Configurar Exclusiones en Cyberduck

#### Opción A: Usar archivo de exclusiones
1. Abrir Cyberduck
2. Ir a **Preferencias > Sincronización**
3. Agregar exclusiones basadas en `.cyberduck-exclusions`

#### Opción B: Configurar manualmente
Agregar estas exclusiones en Cyberduck:

```
# Dependencias (se instalan en el servidor)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Builds (se generan en el servidor)
dist/
build/

# Archivos de desarrollo
.env.local
.env.development.local
.env.test.local

# Archivos de IDE
.vscode/
.idea/
*.swp
*.swo

# Archivos del sistema
.DS_Store
Thumbs.db
*~

# Cache y temporales
.cache/
.vite/
.parcel-cache/
.npm/
*.tmp
*.temp

# Logs
*.log
logs/

# Backup
*.bak
*.backup
*.old
```

### 3. Usar Sincronización Incremental

En Cyberduck:
1. **Solo sincronizar archivos modificados**
2. **Usar comparación de fechas de modificación**
3. **Habilitar sincronización bidireccional**

## 🚀 Alternativa: Script de Sincronización Optimizada

En lugar de usar Cyberduck, puedes usar el script generado:

```bash
# Ejecutar sincronización optimizada
chmod +x sync-to-server.sh
./sync-to-server.sh
```

Este script:
- ✅ Sincroniza solo archivos esenciales
- ✅ Instala dependencias en el servidor
- ✅ Construye la aplicación en el servidor
- ✅ Reinicia servicios automáticamente

## 📊 Comparación de Tiempos

| Método | Tiempo Estimado | Archivos |
|--------|----------------|----------|
| Sincronización completa | 30+ minutos | 50,000+ |
| Sincronización optimizada | 2-5 minutos | 500-1000 |
| Script rsync | 1-2 minutos | 500-1000 |

## 🔧 Configuración Recomendada para Cyberduck

### 1. Configuración de Sincronización
- **Modo:** Incremental
- **Comparación:** Por fecha de modificación
- **Dirección:** Bidireccional
- **Intervalo:** Manual o cada 5 minutos

### 2. Configuración de Conexión
- **Protocolo:** SFTP
- **Puerto:** 22
- **Compresión:** Habilitada
- **Conexiones paralelas:** 4-8

### 3. Exclusiones Específicas
```
# Excluir completamente
node_modules/
dist/
build/
.git/
.cache/
.vite/

# Excluir patrones
*.log
*.tmp
*.temp
*.bak
.DS_Store
Thumbs.db
```

## 🎯 Flujo de Trabajo Optimizado

### Para Desarrollo Diario:
1. **Desarrollar localmente**
2. **Ejecutar limpieza:** `./optimize-sync.sh`
3. **Sincronizar con Cyberduck** (2-5 minutos)
4. **En el servidor:** `./deploy-apache.sh`

### Para Despliegues Importantes:
1. **Hacer commit a Git**
2. **Usar script de sincronización:** `./sync-to-server.sh`
3. **Verificar despliegue automático**

## 📈 Beneficios de la Optimización

### Antes:
- ⏱️ 30+ minutos de sincronización
- 📁 50,000+ archivos
- 💾 Uso excesivo de ancho de banda
- 🔄 Sincronización innecesaria

### Después:
- ⚡ 2-5 minutos de sincronización
- 📁 500-1000 archivos esenciales
- 💾 Uso eficiente de ancho de banda
- 🔄 Solo archivos modificados

## 🛡️ Mantenimiento

### Limpieza Regular:
```bash
# Ejecutar semanalmente
./optimize-sync.sh
```

### Verificación de Exclusiones:
```bash
# Verificar que las exclusiones funcionen
find . -name "node_modules" -type d
find . -name "dist" -type d
```

## 🚨 Solución de Problemas

### Si la sincronización sigue siendo lenta:
1. **Verificar exclusiones en Cyberduck**
2. **Ejecutar limpieza:** `./optimize-sync.sh`
3. **Usar script alternativo:** `./sync-to-server.sh`

### Si faltan archivos:
1. **Verificar exclusiones**
2. **Sincronizar manualmente archivos faltantes**
3. **Revisar logs de Cyberduck**

---

**¡Con estas optimizaciones, tu sincronización debería pasar de 30 minutos a solo 2-5 minutos!** ⚡ 