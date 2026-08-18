import { useEffect, useState, useMemo } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ShopOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useAuthStore, isTokenExpired } from './stores/authStore'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import InicioPage from './pages/InicioPage'
import ProductosPage from './pages/ProductosPage'
import CategoriasPage from './pages/productos/CategoriasPage'
import KardexPage from './pages/productos/KardexPage'
import ComprasPage from './pages/ComprasPage'
import ProveedoresPage from './pages/ProveedoresPage'
import VentasPage from './pages/VentasPage'
import CotizacionesPage from './pages/CotizacionesPage'
import ClientesPage from './pages/ClientesPage'
import GastosPage from './pages/GastosPage'
import ReportesPage from './pages/ReportesPage'
import ConfiguracionesPage from './pages/configuracion/ConfiguracionesPage'
import EmpresaPage from './pages/configuracion/EmpresaPage'
import UsuariosPage from './pages/configuracion/UsuariosPage'
import RolesPage from './pages/configuracion/RolesPage'
import ModulosPage from './pages/configuracion/ModulosPage'
import ComprobantesPage from './pages/configuracion/ComprobantesPage'
import EstadosPage from './pages/configuracion/EstadosPage'

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return { key, icon, children, label } as MenuItem
}

const MODULE_ROUTE_MAP: Record<string, string> = {
  Dashboard: '/',
  Productos: '/productos/lista',
  Categorias: '/productos/categorias',
  Compras: '/entradas/compras',
  Proveedores: '/entradas/proveedores',
  Ventas: '/salidas/ventas',
  Cotizaciones: '/cotizaciones',
  Clientes: '/salidas/clientes',
  Reportes: '/reportes',
  Usuarios: '/configuracion/usuarios',
  Roles: '/configuracion/roles',
  Modulos: '/configuracion/modulos',
  Comprobantes: '/configuracion/comprobantes',
  Estados: '/configuracion/estados',
  Empresa: '/configuracion/empresa',
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

  const moduloNombres = new Set(modulos.map((m) => m.nombre))
  const hasModule = (name: string) => moduloNombres.has(name)
  const hasAny = (...names: string[]) => names.some((n) => moduloNombres.has(n))

  const menuItems = useMemo(() => {
    const items: MenuItem[] = []

    if (hasModule('Dashboard')) {
      items.push(getItem('Inicio', '/', <DashboardOutlined />))
    }

    if (hasModule('Productos')) {
      const children: MenuItem[] = []
      children.push(getItem('Lista', '/productos/lista', <UnorderedListOutlined />))
      if (hasModule('Categorias')) children.push(getItem('Categorías', '/productos/categorias', <AppstoreOutlined />))
      children.push(getItem('Kardex', '/productos/kardex', <HistoryOutlined />))
      items.push(getItem('Productos', 'productos-group', <ShoppingCartOutlined />, children))
    }

    if (hasAny('Compras', 'Proveedores')) {
      const children: MenuItem[] = []
      if (hasModule('Compras')) children.push(getItem('Compras', '/entradas/compras', <ShoppingOutlined />))
      if (hasModule('Proveedores')) children.push(getItem('Proveedores', '/entradas/proveedores', <TeamOutlined />))
      items.push(getItem('Entradas', 'entradas-group', <ShoppingOutlined />, children))
    }

    if (hasAny('Ventas', 'Clientes')) {
      const children: MenuItem[] = []
      if (hasModule('Ventas')) children.push(getItem('Ventas', '/salidas/ventas', <ShopOutlined />))
      if (hasModule('Cotizaciones')) children.push(getItem('Cotizaciones', '/cotizaciones', <FileTextOutlined />))
      if (hasModule('Clientes')) children.push(getItem('Clientes', '/salidas/clientes', <TeamOutlined />))
      items.push(getItem('Salidas', 'salidas-group', <ShopOutlined />, children))
    }

    items.push(getItem('Gastos', '/gastos', <DollarOutlined />))

    if (hasModule('Reportes')) {
      items.push(getItem('Reportes', '/reportes', <FileTextOutlined />))
    }

    const hasConfigModules = ['Usuarios', 'Roles', 'Modulos', 'Comprobantes', 'Estados', 'Empresa'].some((m) => hasModule(m))
    if (hasConfigModules) {
      const children: MenuItem[] = []
      if (hasModule('Empresa')) children.push(getItem('Empresa', '/configuracion/empresa', <ShopOutlined />))
      if (hasModule('Usuarios')) children.push(getItem('Usuarios', '/configuracion/usuarios', <UserOutlined />))
      if (hasModule('Roles')) children.push(getItem('Roles', '/configuracion/roles', <TeamOutlined />))
      if (hasModule('Modulos')) children.push(getItem('Módulos', '/configuracion/modulos', <AppstoreOutlined />))
      if (hasModule('Comprobantes')) children.push(getItem('Comprobantes', '/configuracion/comprobantes', <FileTextOutlined />))
      if (hasModule('Estados')) children.push(getItem('Estados', '/configuracion/estados', <SettingOutlined />))
      items.push(getItem('Configuración', 'config-group', <SettingOutlined />, children))
    }

    return items
  }, [modulos])

  const moduloPaths = new Set(modulos.map((m) => MODULE_ROUTE_MAP[m.nombre]).filter(Boolean))
  const hasAccess = (path: string) => moduloPaths.has(path)

  if (checking) return null

  if (isAuthenticated && (!token || !hasModules)) {
    logout()
    return <Navigate to="/login" />
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/" element={validSession ? <AppLayout menuItems={menuItems}><Outlet /></AppLayout> : <Navigate to="/login" />}>
        <Route index element={<InicioPage />} />

        {hasAccess('/productos/lista') && <Route path="productos/lista" element={<ProductosPage />} />}
        {hasAccess('/productos/categorias') && <Route path="productos/categorias" element={<CategoriasPage />} />}
        {hasModule('Productos') && <Route path="productos/kardex" element={<KardexPage />} />}
        {hasAccess('/entradas/compras') && <Route path="entradas/compras" element={<ComprasPage />} />}
        {hasAccess('/entradas/proveedores') && <Route path="entradas/proveedores" element={<ProveedoresPage />} />}
        {hasAccess('/salidas/ventas') && <Route path="salidas/ventas" element={<VentasPage />} />}
        {hasAccess('/cotizaciones') && <Route path="cotizaciones" element={<CotizacionesPage />} />}
        {hasAccess('/salidas/clientes') && <Route path="salidas/clientes" element={<ClientesPage />} />}

        <Route path="gastos" element={<GastosPage />} />
        {hasAccess('/reportes') && <Route path="reportes" element={<ReportesPage />} />}

        <Route path="configuracion" element={<ConfiguracionesPage />}>
          {hasAccess('/configuracion/empresa') && <Route path="empresa" element={<EmpresaPage />} />}
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
