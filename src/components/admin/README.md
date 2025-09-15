# Componente AdminNavigationButtons

Este componente proporciona botones de navegación administrativa similares a los botones de "Regresar al Dashboard" que se usan en las páginas de cliente, pero adaptados para administradores con acciones administrativas específicas.

## Características

- **Botones de Navegación Principal:**
  - Regresar (navega a la página anterior)
  - Inicio (navega a la página principal)
  - Dashboard Admin (navega al panel de administrador)
  - Panel Cliente (navega al panel de cliente)

- **Acciones Administrativas Rápidas:**
  - Gestionar Clientes
  - Gestionar Operadores
  - Gestionar Órdenes
  - Gestionar Rutas
  - Incidencias
  - Tratamientos
  - Certificados
  - Planes

## Uso Básico

```jsx
import AdminNavigationButtons from '@/components/admin/AdminNavigationButtons';

// En tu componente
<AdminNavigationButtons />
```

## Props Disponibles

| Prop | Tipo | Por Defecto | Descripción |
|------|------|-------------|-------------|
| `showBackButton` | boolean | `true` | Muestra/oculta el botón de regresar |
| `showHomeButton` | boolean | `true` | Muestra/oculta el botón de inicio |
| `showQuickActions` | boolean | `true` | Muestra/oculta las acciones administrativas rápidas |
| `className` | string | `"mb-6"` | Clases CSS adicionales para el contenedor |

## Ejemplos de Uso

### Navegación Completa (por defecto)
```jsx
<AdminNavigationButtons />
```

### Solo Botones Principales
```jsx
<AdminNavigationButtons showQuickActions={false} />
```

### Sin Botón de Regresar
```jsx
<AdminNavigationButtons showBackButton={false} />
```

### Sin Botón de Inicio
```jsx
<AdminNavigationButtons showHomeButton={false} />
```

### Personalizado
```jsx
<AdminNavigationButtons 
  showBackButton={false} 
  showQuickActions={false}
  className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200"
/>
```

## Implementación en Páginas de Admin

El componente ya está implementado en las siguientes páginas:

- ✅ AdminClientsPage
- ✅ AdminOperatorsPage  
- ✅ AdminOrdersPage
- ✅ AdminRoutesPage
- ✅ AdminPlansPage
- ✅ AdminIncidentsPage
- ✅ AdminTreatmentsPage
- ✅ AdminCertificatesPage

## Estructura del Componente

```
AdminNavigationButtons
├── Botones Principales
│   ├── Regresar (ArrowLeft)
│   ├── Inicio (Home)
│   ├── Dashboard Admin (Shield)
│   └── Panel Cliente (Users)
└── Acciones Administrativas Rápidas
    ├── Gestionar Clientes (Users)
    ├── Gestionar Operadores (Truck)
    ├── Gestionar Órdenes (Package)
    ├── Gestionar Rutas (Map)
    ├── Incidencias (AlertTriangle)
    ├── Tratamientos (FlaskConical)
    ├── Certificados (Shield)
    └── Planes (BarChart3)
```

## Estilos

- **Botones principales:** Outline con colores específicos para cada función
- **Acciones rápidas:** Grid responsive que se adapta a diferentes tamaños de pantalla
- **Colores temáticos:** Cada acción tiene su propio color distintivo
- **Hover effects:** Transiciones suaves y efectos visuales
- **Responsive:** Se adapta a dispositivos móviles y de escritorio

## Rutas de Navegación

Todas las acciones rápidas navegan a las rutas correspondientes del panel de administrador:

- `/mir/admin/clientes` - Gestión de Clientes
- `/mir/admin/operadores` - Gestión de Operadores
- `/mir/admin/ordenes` - Gestión de Órdenes
- `/mir/admin/rutas` - Gestión de Rutas
- `/mir/admin/incidencias` - Gestión de Incidencias
- `/mir/admin/tratamientos` - Gestión de Tratamientos
- `/mir/admin/certificados` - Gestión de Certificados
- `/mir/admin/planes-admin` - Gestión de Planes

## Dependencias

- React Router DOM (useNavigate)
- Lucide React (iconos)
- Componentes UI personalizados (Button)
- Tailwind CSS (estilos)
