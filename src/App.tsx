import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, isTokenExpired } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InicioPage from './pages/InicioPage'
import ProductosPage from './pages/ProductosPage'
import CategoriasPage from './pages/productos/CategoriasPage'
import ComprasPage from './pages/ComprasPage'
import ProveedoresPage from './pages/ProveedoresPage'
import VentasPage from './pages/VentasPage'
import ClientesPage from './pages/ClientesPage'
import GastosPage from './pages/GastosPage'
import ReportesPage from './pages/ReportesPage'
import ConfiguracionesPage from './pages/configuracion/ConfiguracionesPage'
import UsuariosPage from './pages/configuracion/UsuariosPage'
import RolesPage from './pages/configuracion/RolesPage'
import ModulosPage from './pages/configuracion/ModulosPage'
import ComprobantesPage from './pages/configuracion/ComprobantesPage'
import EstadosPage from './pages/configuracion/EstadosPage'

const MODULE_ROUTE_MAP: Record<string, string> = {
  Dashboard: '/',
  Productos: '/productos/lista',
  Categorias: '/productos/categorias',
  Compras: '/entradas/compras',
  Proveedores: '/entradas/proveedores',
  Ventas: '/salidas/ventas',
  Clientes: '/salidas/clientes',
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

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout()
    }
    setChecking(false)
  }, [])

  const hasModules = modulos.length > 0
  const validSession = isAuthenticated && token && hasModules

  if (checking) return null

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
        <Route index element={<InicioPage />} />

        {hasAccess('/productos/lista') && <Route path="productos/lista" element={<ProductosPage />} />}
        {hasAccess('/productos/categorias') && <Route path="productos/categorias" element={<CategoriasPage />} />}
        {hasAccess('/entradas/compras') && <Route path="entradas/compras" element={<ComprasPage />} />}
        {hasAccess('/entradas/proveedores') && <Route path="entradas/proveedores" element={<ProveedoresPage />} />}
        {hasAccess('/salidas/ventas') && <Route path="salidas/ventas" element={<VentasPage />} />}
        {hasAccess('/salidas/clientes') && <Route path="salidas/clientes" element={<ClientesPage />} />}

        <Route path="gastos" element={<GastosPage />} />
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
