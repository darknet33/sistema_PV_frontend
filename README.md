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
cd frontend
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación corre en `http://localhost:3000` con proxy automático al backend en `localhost:8000` (`vite.config.ts` con `ws: true` para WebSocket).

---

## Estructura

```
frontend/
├── src/
│   ├── pages/                    # Páginas (17)
│   │   ├── configuracion/        # Empresa, Usuarios, Roles, Módulos, Comprobantes, Estados
│   │   └── productos/            # CategoriasPage
│   ├── components/               # UI reutilizable
│   ├── hooks/                    # useCrud, useFilters, useRealtimeRefresh
│   ├── services/                 # Llamadas API (Axios) + websocket
│   ├── stores/                   # Estado global (authStore, empresaStore)
│   ├── types/                    # Interfaces TypeScript
│   └── utils/                    # format, pricing, download
├── package.json
└── vite.config.ts
```

### Componentes

| Componente | Uso |
|------------|-----|
| `AppLayout.tsx` | Layout con menú lateral (logo empresa, items por módulos) |
| `SideNav.tsx` | Navegación lateral |
| `PageHeader.tsx` | Encabezado de página con título y acciones |
| `CrudModal.tsx` / `CrudPage.tsx` | Patrón CRUD genérico (tabla + modal) |
| `ResponsiveTable.tsx` | Tabla responsive (cards en móvil, tabla en escritorio) |
| `SubCrudModal.tsx` / `SubCrudSelect.tsx` | Select + modal CRUD embebido (crear/editar registros sin salir del formulario) |
| `ProductoSelectorModal.tsx` | Selector de producto con búsqueda (código, descripción, marca, categoría) |

### Hooks

| Hook | Uso |
|------|-----|
| `useRealtimeRefresh(room, onRefresh)` | Suscripción WebSocket con auto-reconnect (3s) |
| `useCrud` | Lógica CRUD reutilizable |
| `useFilters` | Filtros (texto, rango de fechas, tags) |

---

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/login` | LoginPage | Inicio de sesión (redirige a `/` si autenticado) |
| `/` | InicioPage | Dashboard con menú |
| `/productos/lista` | ProductosPage | CRUD + Excel import/export + imágenes |
| `/productos/categorias` | CategoriasPage | CRUD categorías |
| `/entradas/compras` | ComprasPage | CRUD + Anular + PDF |
| `/entradas/proveedores` | ProveedoresPage | CRUD + soft-delete |
| `/salidas/ventas` | VentasPage | CRUD + Anular + PDF + impuesto/descuento |
| `/cotizaciones` | CotizacionesPage | CRUD cotizaciones + PDF + convertir en venta |
| `/salidas/clientes` | ClientesPage | CRUD |
| `/gastos` | GastosPage | Gastos |
| `/reportes` | ReportesPage | Reportes PDF |
| `/configuracion` | ConfiguracionesPage | Sub-módulos |
| `/configuracion/empresa` | EmpresaPage | Datos empresa, logo, encabezado, pie, colores |
| `/configuracion/usuarios` | UsuariosPage | CRUD usuarios |
| `/configuracion/roles` | RolesPage | CRUD roles |
| `/configuracion/modulos` | ModulosPage | CRUD módulos |
| `/configuracion/comprobantes` | ComprobantesPage | CRUD |
| `/configuracion/estados` | EstadosPage | CRUD |

Las rutas se protegen con `hasAccess(path)` (compara contra los módulos del usuario vía `MODULE_ROUTE_MAP`).

---

## Módulo Cotizaciones

Archivos clave:

| Archivo | Rol |
|---------|-----|
| `pages/CotizacionesPage.tsx` | Página principal |
| `services/cotizacionService.ts` | Llamadas a `/api/cotizaciones` |
| `types/cotizacion.ts` | Interfaces `CotizacionCreate`, `CotizacionUpdate`, `ConvertirVentaRequest` |
| `reports/cotizacion_single.py` (backend) | PDF |

Flujo:
1. **Crear**: cliente, fecha, validez (días, default 15), `con_factura` (IVA 16%), `incluir_imagenes`, modalidad de pago, forma de pago (Transferencia SIGEP / Cheque / Al contado), descuento %, términos y condiciones + detalle de líneas (producto, cantidad, costo, utilidad % → precio de venta calculado).
2. **Confirmar**: pasa a `Confirmado` (solo desde `Enviado`).
3. **Convertir en venta**: selecciona comprobante y estado → crea la venta (descuenta stock, IVA si `con_factura`).
4. **PDF**: descarga o vista previa (`/pdf` y `/pdf/preview`).

Convenciones específicas:
- IVA 16% si `con_factura`; descuento % restado sobre el subtotal (backend calcula y envía `subtotal`, `iva`, `descuento`, `total`).
- Estados: `Enviado` (tags), `Confirmado`, `Vencido` (automático si pasó `fecha_vencimiento`).
- `COT-{id:06d}`: número generado por el backend.
- El selector de producto reutiliza `ProductoSelectorModal`; los selects de cliente/comprobante/estado usan `SubCrudSelect`.

---

## Convenciones

- **Moneda**: Bs. (Bolivianos), NO S/.
- **Decimales**: Usar `Number(val || 0)` para evitar errores de `.toFixed`
- **Fechas**: Day.js; `startOf('day')` / `endOf('day')` para filtros por rango
- **N° Comprobante**: Switch Auto/Manual; por defecto Automático en Ventas
- **Anular**: Botón amarillo si no está anulado; eliminar solo si anulado
- **Stock**: En ventas, si la cantidad supera el stock disponible se muestra una advertencia roja; el backend rechaza la operación
- **Precio Base**: Calculado en producto como `peso === 0 ? costo + utilidad : peso * costo + utilidad`. Columnas en tabla: Costo Bs., Utilidad Bs., Precio Base
- **Cache**: Si hay errores extraños, eliminar `node_modules/.vite`
- **Logo empresa**: el menú y el login usan `empresa.logo`; al re-subir el logo en Configuración > Empresa el navegador puede seguir mostrando la imagen anterior por caché (misma URL `/uploads/empresa/logo.png`) — abrir en otra pestaña o limpiar caché
- **Productos.xlsx**: Plantilla base para importación (12 columnas: ÏD, Código, Categoría, Descripción, Marca, Procedencia, Costo Bs., Utilidad Bs., Stock Inicial, Stock Mínimo, Stock Máximo, Estado)
- **WebSocket**: salas `productos`, `ventas`, `compras`, `dashboard`, `reportes`, `cotizaciones`
