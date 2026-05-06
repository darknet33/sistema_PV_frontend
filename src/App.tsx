import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductosPage from './pages/ProductosPage'
import ComprasPage from './pages/ComprasPage'
import VentasPage from './pages/VentasPage'
import ClientesPage from './pages/ClientesPage'
import ProveedoresPage from './pages/ProveedoresPage'
import ReportesPage from './pages/ReportesPage'
import ConfiguracionesPage from './pages/configuracion/ConfiguracionesPage'
import UsuariosPage from './pages/configuracion/UsuariosPage'
import RolesPage from './pages/configuracion/RolesPage'
import ModulosPage from './pages/configuracion/ModulosPage'
import ComprobantesPage from './pages/configuracion/ComprobantesPage'
import EstadosPage from './pages/configuracion/EstadosPage'

const MODULE_ROUTE_MAP: Record<string, string> = {
  Dashboard: '/',
  Productos: '/productos',
  Compras: '/compras',
  Ventas: '/ventas',
  Clientes: '/clientes',
  Proveedores: '/proveedores',
  Reportes: '/reportes',
  Usuarios: '/configuracion/usuarios',
  Roles: '/configuracion/roles',
  Modulos: '/configuracion/modulos',
  Comprobantes: '/configuracion/comprobantes',
  Estados: '/configuracion/estados',
}

function App() {
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const modulos = useAuthStore((state) => state.modulos)
  const logout = useAuthStore((state) => state.logout)

  const hasModules = modulos.length > 0
  const validSession = isAuthenticated && token && hasModules

  if (isAuthenticated && (!token || !hasModules)) {
    logout()
    return <Navigate to="/login" />
  }

  const moduloPaths = new Set(modulos.map((m) => MODULE_ROUTE_MAP[m.nombre]).filter(Boolean))
  const hasAccess = (path: string) => moduloPaths.has(path)

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/" element={validSession ? <DashboardPage /> : <Navigate to="/login" />}>
        {hasAccess('/productos') && <Route path="productos" element={<ProductosPage />} />}
        {hasAccess('/compras') && <Route path="compras" element={<ComprasPage />} />}
        {hasAccess('/ventas') && <Route path="ventas" element={<VentasPage />} />}
        {hasAccess('/clientes') && <Route path="clientes" element={<ClientesPage />} />}
        {hasAccess('/proveedores') && <Route path="proveedores" element={<ProveedoresPage />} />}
        {hasAccess('/reportes') && <Route path="reportes" element={<ReportesPage />} />}
        <Route path="configuracion" element={<ConfiguracionesPage />}>
          {hasAccess('/configuracion/usuarios') && <Route path="usuarios" element={<UsuariosPage />} />}
          {hasAccess('/configuracion/roles') && <Route path="roles" element={<RolesPage />} />}
          <Route path="modulos" element={<ModulosPage />} />
          {hasAccess('/configuracion/comprobantes') && <Route path="comprobantes" element={<ComprobantesPage />} />}
          {hasAccess('/configuracion/estados') && <Route path="estados" element={<EstadosPage />} />}
        </Route>
      </Route>
    </Routes>
  )
}

export default App
