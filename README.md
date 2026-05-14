# Sistema Rhino v3.0 — Frontend

SPA para sistema de inventario POS.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 |
| Lenguaje | TypeScript |
| Build | Vite 5 |
| UI | Ant Design 5 |
| Estado | Zustand |
| HTTP | Axios |
| Fechas | Day.js |

## Requisitos

- Node.js 18+

## Instalación

```bash
cd sistema_PV_frontend
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación corre en `http://localhost:3000` con proxy automático al backend en `localhost:8000`.

---

## Estructura

```
sistema_PV_frontend/
├── src/
│   ├── pages/             # Páginas (Login, Dashboard, etc.)
│   ├── services/          # Llamadas API (Axios)
│   ├── types/             # Interfaces TypeScript
│   ├── stores/            # Estado global (Zustand)
│   └── App.tsx            # Router + auth guard
├── productos.xlsx         # Plantilla para importar productos
├── package.json
└── vite.config.ts
```

---

## Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | LoginPage | Inicio de sesión |
| `/` | DashboardPage | Layout con menú |
| `/productos` | ProductosPage | CRUD + Excel import/export |
| `/compras` | ComprasPage | CRUD + Anular + PDF |
| `/ventas` | VentasPage | CRUD + Anular + PDF + impuesto/descuento |
| `/clientes` | ClientesPage | CRUD |
| `/proveedores` | ProveedoresPage | CRUD + soft-delete |
| `/reportes` | ReportesPage | Reportes PDF |
| `/configuracion/*` | ConfiguracionesPage | Sub-módulos |

---

## Convenciones

- **Moneda**: Bs. (Bolivianos), NO S/.
- **Decimales**: Usar `Number(val || 0)` para evitar errores de `.toFixed`
- **Fechas**: Day.js; `startOf('day')` / `endOf('day')` para filtros por rango
- **N° Comprobante**: Switch Auto/Manual; por defecto Automático en Ventas
- **Anular**: Botón amarillo si no está anulado; eliminar solo si anulado
- **Cache**: Si hay errores extraños, eliminar `node_modules/.vite`
- **Productos.xlsx**: Plantilla base para importación de productos
