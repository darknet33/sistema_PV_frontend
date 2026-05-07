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
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout

const MODULE_ROUTE_MAP: Record<string, { path: string; icon: React.ReactNode; label: string; parent?: string; parentIcon?: React.ReactNode }> = {
  Dashboard: { path: '/', icon: <DashboardOutlined />, label: 'Inicio' },
  Productos: { path: '/productos', icon: <ShoppingCartOutlined />, label: 'Productos' },
  Categorias: { path: '/configuracion/categorias', icon: <AppstoreOutlined />, label: 'Categorías', parent: 'Configuraciones', parentIcon: <SettingOutlined /> },
  Compras: { path: '/compras', icon: <ShoppingOutlined />, label: 'Compras' },
  Ventas: { path: '/ventas', icon: <ShopOutlined />, label: 'Ventas' },
  Clientes: { path: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
  Proveedores: { path: '/proveedores', icon: <ShopOutlined />, label: 'Proveedores' },
  Reportes: { path: '/reportes', icon: <FileTextOutlined />, label: 'Reportes' },
  Usuarios: { path: '/configuracion/usuarios', icon: <UserOutlined />, label: 'Usuarios', parent: 'Configuraciones', parentIcon: <SettingOutlined /> },
  Roles: { path: '/configuracion/roles', icon: <UserOutlined />, label: 'Roles', parent: 'Configuraciones', parentIcon: <SettingOutlined /> },
  Comprobantes: { path: '/configuracion/comprobantes', icon: <FileTextOutlined />, label: 'Comprobantes', parent: 'Configuraciones', parentIcon: <SettingOutlined /> },
  Estados: { path: '/configuracion/estados', icon: <SettingOutlined />, label: 'Estados', parent: 'Configuraciones', parentIcon: <SettingOutlined /> },
}

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const modulos = useAuthStore((state) => state.modulos)
  const usuario = useAuthStore((state) => state.usuario)

  const menuItems = useMemo(() => {
    const moduloNombres = new Set(modulos.map((m) => m.nombre))
    const items: MenuProps['items'] = []
    const hasConfigModules = ['Usuarios', 'Roles', 'Modulos', 'Categorias', 'Comprobantes', 'Estados'].some((m) => moduloNombres.has(m))

    for (const moduloNombre of moduloNombres) {
      const mapping = MODULE_ROUTE_MAP[moduloNombre]
      if (!mapping) continue
      if (mapping.parent) continue

      items.push({
        key: mapping.path,
        icon: mapping.icon,
        label: mapping.label,
      })
    }

    if (hasConfigModules) {
      items.push({
        key: '/configuracion/usuarios',
        icon: <SettingOutlined />,
        label: 'Configuraciones',
      })
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
