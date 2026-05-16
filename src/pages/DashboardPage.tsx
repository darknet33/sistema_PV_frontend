import { useState, useMemo } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd'
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ShopOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return { key, icon, children, label } as MenuItem
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const modulos = useAuthStore((state) => state.modulos)
  const usuario = useAuthStore((state) => state.usuario)

  const menuItems = useMemo(() => {
    const moduloNombres = new Set(modulos.map((m) => m.nombre))
    const hasModule = (name: string) => moduloNombres.has(name)
    const hasAny = (...names: string[]) => names.some((n) => moduloNombres.has(n))
    const items: MenuItem[] = []

    if (hasModule('Dashboard')) {
      items.push(getItem('Inicio', '/', <DashboardOutlined />))
    }

    if (hasAny('Productos', 'Categorias')) {
      const children: MenuItem[] = []
      if (hasModule('Productos')) children.push(getItem('Lista', '/productos/lista', <UnorderedListOutlined />))
      if (hasModule('Categorias')) children.push(getItem('Categorías', '/productos/categorias', <AppstoreOutlined />))
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
      if (hasModule('Clientes')) children.push(getItem('Clientes', '/salidas/clientes', <TeamOutlined />))
      items.push(getItem('Salidas', 'salidas-group', <ShopOutlined />, children))
    }

    items.push(getItem('Gastos', '/gastos', <DollarOutlined />))

    if (hasModule('Reportes')) {
      items.push(getItem('Reportes', '/reportes', <FileTextOutlined />))
    }

    const hasConfigModules = ['Usuarios', 'Roles', 'Modulos', 'Comprobantes', 'Estados'].some((m) => hasModule(m))
    if (hasConfigModules) {
      const children: MenuItem[] = []
      if (hasModule('Usuarios')) children.push(getItem('Usuarios', '/configuracion/usuarios', <UserOutlined />))
      if (hasModule('Roles')) children.push(getItem('Roles', '/configuracion/roles', <TeamOutlined />))
      if (hasModule('Modulos')) children.push(getItem('Módulos', '/configuracion/modulos', <AppstoreOutlined />))
      if (hasModule('Comprobantes')) children.push(getItem('Comprobantes', '/configuracion/comprobantes', <FileTextOutlined />))
      if (hasModule('Estados')) children.push(getItem('Estados', '/configuracion/estados', <SettingOutlined />))
      items.push(getItem('Configuración', 'config-group', <SettingOutlined />, children))
    }

    return items
  }, [modulos])

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          {!collapsed && 'RHINO 3.0'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: '24px',
            background: '#fff',
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
