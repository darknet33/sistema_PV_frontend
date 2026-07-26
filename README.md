# Sistema de Inventario v3.0 — Frontend

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
cd frontend
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación corre en `http://localhost:3000` con proxy automático al backend en `localhost:8000`.

---

## Despliegue

### Vercel (Producción)

- **URL**: https://frontend-xi-eight-66.vercel.app
- **Rama**: `deploy`
- **Configuración**: `vercel.json` con rewrites para:
  - Proxy `/api/*` → Backend en Render
  - Redirect SPA → `index.html` (React Router)

### Deploy manual

```bash
git checkout deploy
vercel --prod --yes
```

---

## Estructura

```
frontend/
├── src/
│   ├── pages/             # Páginas (Login, Dashboard, etc.)
│   ├── services/          # Llamadas API (Axios)
│   ├── types/             # Interfaces TypeScript
│   ├── stores/            # Estado global (Zustand)
│   └── App.tsx            # Router + auth guard
├── vercel.json            # Configuración de despliegue Vercel
├── productos.xlsx         # Plantilla para importar productos
├── package.json
└── vite.config.ts
```

---

## Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | LoginPage | Inicio de sesión |
| `/` | InicioPage | Dashboard |
| `/productos/lista` | ProductosPage | CRUD + Excel import/export |
| `/productos/categorias` | CategoriasPage | CRUD categorías |
| `/entradas/compras` | ComprasPage | CRUD + Anular + PDF |
| `/entradas/proveedores` | ProveedoresPage | CRUD + soft-delete |
| `/salidas/ventas` | VentasPage | CRUD + Anular + PDF + impuesto/descuento |
| `/salidas/clientes` | ClientesPage | CRUD |
| `/gastos` | GastosPage | CRUD gastos |
| `/reportes` | ReportesPage | Reportes PDF |
| `/configuracion/usuarios` | UsuariosPage | CRUD usuarios |
| `/configuracion/roles` | RolesPage | CRUD roles |
| `/configuracion/modulos` | ModulosPage | CRUD módulos |
| `/configuracion/comprobantes` | ComprobantesPage | CRUD comprobantes |
| `/configuracion/estados` | EstadosPage | CRUD estados |

---

## Convenciones

- **Moneda**: Bs. (Bolivianos), NO S/.
- **Decimales**: Usar `Number(val || 0)` para evitar errores de `.toFixed`
- **Fechas**: Day.js; `startOf('day')` / `endOf('day')` para filtros por rango
- **N° Comprobante**: Switch Auto/Manual; por defecto Automático en Ventas
- **Anular**: Botón amarillo si no está anulado; eliminar solo si anulado
- **Stock**: En ventas, si la cantidad supera el stock disponible se muestra una advertencia roja; el backend rechaza la operación
- **Precio Base**: Calculado en producto como `peso === 0 ? costo + utilidad : peso * costo + utilidad`
- **Cache**: Si hay errores extraños, eliminar `node_modules/.vite`
- **Productos.xlsx**: Plantilla base para importación (11 columnas)
- **WebSocket**: Auto-reconexión cada 3s; rooms: `productos`, `ventas`, `compras`, `dashboard`, `reportes`
