# 🎓 Sistema de Certificados - MIR

## ✅ Funcionalidad Implementada

Hemos completado la implementación del **Sistema de Certificados** completo, incluyendo:

- ✅ **Generación de PDFs** de certificados y manifiestos
- ✅ **Almacenamiento en Supabase Storage** 
- ✅ **Gestión administrativa** completa
- ✅ **Descarga para clientes** 
- ✅ **Numeración automática** de documentos
- ✅ **Integración con tracking** de órdenes

## 🔧 Pasos para Implementar

### 1. Instalar Dependencias

```bash
npm install jspdf html2canvas
```

### 2. Configurar Supabase Storage

1. **Verificar bucket `uploads`** existe
2. **Configurar políticas RLS** para certificados
3. **Permitir archivos PDF** (si no está configurado)

### 3. Ejecutar Scripts SQL

1. **Ejecutar `database-setup.sql`** (si no se ha hecho)
2. **Ejecutar `certificates-database-update.sql`** para campos adicionales

### 4. Verificar Archivos Creados

- ✅ `src/lib/certificateGenerator.js` - Generador de PDFs
- ✅ `src/lib/certificateService.js` - Servicios de certificados
- ✅ `src/pages/admin/AdminCertificatesPage.jsx` - Admin de certificados
- ✅ `src/pages/PastCollectionsPage.jsx` - Vista del cliente

## 🧪 Probar la Funcionalidad

### Como Admin:
1. **Iniciar sesión** con usuario rol `admin`
2. **Ir a** `/mir/admin/certificados`
3. **Ver órdenes listas** para certificar
4. **Generar manifiesto** (opcional)
5. **Generar certificado** de destrucción
6. **Verificar** que aparece en "Certificados Emitidos"

### Como Cliente:
1. **Iniciar sesión** con usuario rol `user`
2. **Ir a** `/mir/usuario/manifiestos`
3. **Ver historial** de recolecciones
4. **Descargar manifiesto** (si está disponible)
5. **Descargar certificado** (si está disponible)

## 🔒 Seguridad Implementada

### Row Level Security (RLS):
- ✅ **Usuarios** solo ven sus propios certificados
- ✅ **Admins** pueden generar y gestionar todos los certificados
- ✅ **Archivos** solo accesibles por propietario
- ✅ **Validación de roles** en funciones RPC

### Validaciones:
- ✅ **Verificación de estado** de orden antes de certificar
- ✅ **Generación automática** de números únicos
- ✅ **Manejo de errores** robusto
- ✅ **Limpieza** de elementos temporales

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── certificateGenerator.js    # ✅ Generador de PDFs
│   └── certificateService.js     # ✅ Servicios de certificados
├── pages/
│   ├── admin/
│   │   └── AdminCertificatesPage.jsx  # ✅ Admin de certificados
│   └── PastCollectionsPage.jsx        # ✅ Vista del cliente
└── database/
    ├── database-setup.sql              # ✅ Configuración base
    └── certificates-database-update.sql # ✅ Campos de certificados
```

## 🚨 Solución de Problemas

### Error: "jsPDF no está definido"
- Verificar que `jspdf` está instalado
- Revisar imports en `certificateGenerator.js`

### Error: "Bucket no encontrado"
- Verificar que el bucket `uploads` existe
- Verificar políticas RLS de Storage

### Error: "Campos no encontrados"
- Ejecutar `certificates-database-update.sql`
- Verificar que los campos se agregaron a `service_orders`

### PDFs no se generan
- Verificar que `html2canvas` está instalado
- Revisar consola del navegador para errores
- Verificar que el DOM se renderiza correctamente

## 🔄 Flujo de Datos

```
1. Admin selecciona orden para certificar
   ↓
2. Sistema genera PDF del certificado
   ↓
3. PDF se convierte a blob
   ↓
4. Archivo se sube a Supabase Storage
   ↓
5. URL se almacena en service_orders
   ↓
6. Estado de orden cambia a CERTIFIED
   ↓
7. Evento de tracking se crea
   ↓
8. Cliente puede descargar certificado
```

## 📊 Campos de la Base de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `certificate_url` | TEXT | URL del certificado PDF en Storage |
| `manifest_url` | TEXT | URL del manifiesto PDF en Storage |
| `certificate_generated_at` | TIMESTAMPTZ | Fecha de generación del certificado |
| `manifest_generated_at` | TIMESTAMPTZ | Fecha de generación del manifiesto |
| `certificate_number` | TEXT | Número único del certificado (CERT-2024-000001) |
| `manifest_number` | TEXT | Número único del manifiesto (MAN-2024-000001) |

## 🎯 Características del PDF

### Certificado de Destrucción:
- ✅ **Encabezado** con logo TRABAMEX
- ✅ **Información del cliente** y orden
- ✅ **Detalles del residuo** procesado
- ✅ **Proceso de tratamiento** descrito
- ✅ **Firmas** de responsable técnico y autoridad
- ✅ **Sello** de certificado
- ✅ **Numeración única** automática

### Manifiesto de Entrega:
- ✅ **Encabezado** con logo TRABAMEX
- ✅ **Información de la recolección**
- ✅ **Detalles del residuo** entregado
- ✅ **Condiciones de entrega**
- ✅ **Firmas** de cliente y responsable
- ✅ **Numeración única** automática

## 🔧 Funciones RPC Creadas

### `generate_certificate_number()`
- Genera números únicos para certificados
- Formato: `CERT-2024-000001`
- Secuencia automática por año

### `generate_manifest_number()`
- Genera números únicos para manifiestos
- Formato: `MAN-2024-000001`
- Secuencia automática por año

### `get_certificate_stats()`
- Obtiene estadísticas de certificados
- Total de órdenes, certificados, pendientes, manifiestos

### `cleanup_old_certificates()`
- Limpia certificados antiguos (opcional)
- Configurable por días de antigüedad

## 📱 Interfaz de Usuario

### Admin:
- **Lista de órdenes** listas para certificar
- **Botones de acción** para generar manifiesto/certificado
- **Historial** de certificados emitidos
- **Estadísticas** en tiempo real
- **Vista previa** y descarga de PDFs

### Cliente:
- **Historial** de recolecciones
- **Estado** de cada orden
- **Botones de descarga** para documentos disponibles
- **Fechas** de generación de documentos
- **Resumen** estadístico

## 🎨 Personalización

### Modificar Plantillas:
- Editar funciones en `certificateGenerator.js`
- Cambiar estilos CSS en las plantillas HTML
- Modificar campos mostrados en los PDFs
- Agregar logos o elementos de marca

### Agregar Campos:
- Modificar plantillas HTML
- Actualizar funciones de generación
- Agregar campos en la base de datos
- Actualizar políticas RLS

## 🚀 Próximos Pasos

Una vez implementado este sistema, puedes continuar con:

1. **Gestión de Incidencias** - Reportes de operadores
2. **Flujos de Operador** - Completar paradas
3. **Dashboard de Planes** - Asignación y consumo
4. **Sistema de Reportes** - Métricas avanzadas
5. **Notificaciones** - Email de certificados generados

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar** consola del navegador
2. **Verificar** logs de Supabase
3. **Confirmar** que todos los scripts SQL se ejecutaron
4. **Probar** con usuarios de roles correctos
5. **Verificar** que el bucket de Storage existe

## 🔍 Verificación de Implementación

### Checklist de Verificación:
- [ ] Dependencias instaladas (`jspdf`, `html2canvas`)
- [ ] Scripts SQL ejecutados sin errores
- [ ] Campos agregados a `service_orders`
- [ ] Funciones RPC creadas
- [ ] Archivos JavaScript creados
- [ ] Páginas actualizadas
- [ ] Admin puede generar certificados
- [ ] Cliente puede descargar documentos
- [ ] PDFs se generan correctamente
- [ ] Archivos se almacenan en Storage

---

**¡El Sistema de Certificados está completamente implementado y listo para usar! 🎉**

**Funcionalidades incluidas:**
- ✅ Generación automática de PDFs
- ✅ Almacenamiento seguro en Supabase
- ✅ Gestión administrativa completa
- ✅ Descarga para clientes
- ✅ Numeración única automática
- ✅ Integración con tracking
- ✅ Seguridad RLS implementada
