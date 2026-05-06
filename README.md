# Sistema RHINO - Frontend (Vite + React + TypeScript)

Interfaz de usuario moderna para el sistema de inventario RHINO 3.0.

## Características
- **React 18** con TypeScript
- **Ant Design 5** para UI components
- **Vite** para desarrollo rápido
- **Zustand** para manejo de estado
- **React Router 6** para navegación
- **Axios** para consumo de API
- **React Hook Form** para formularios
- **TanStack Table** para tablas
- **Day.js** para manejo de fechas

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se ejecutará en `http://localhost:3000` con proxy al backend en `http://localhost:8000`.

## Build

```bash
npm run build
```

## Estructura
```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas (Login, Dashboard, Productos, etc.)
├── services/      # API calls (axios)
├── types/         # TypeScript interfaces
├── stores/        # Zustand stores
├── hooks/         # Custom hooks
└── context/       # React context
```

## Páginas Implementadas
- Login con JWT
- Dashboard con menú lateral
- Gestión de Productos (CRUD)
- Gestión de Compras (CRUD)
- Gestión de Ventas (CRUD)
- Gestión de Clientes (CRUD)
- Gestión de Proveedores (CRUD)
- Reportes (Kardex, Ventas, Compras PDF)
