import { useState } from 'react'
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
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: 'Inicio' },
    { key: '/productos', icon: <ShoppingCartOutlined />, label: 'Productos' },
    { key: '/compras', icon: <ShoppingOutlined />, label: 'Compras' },
    { key: '/ventas', icon: <ShopOutlined />, label: 'Ventas' },
    { key: '/clientes', icon: <TeamOutlined />, label: 'Clientes' },
    { key: '/proveedores', icon: <ShopOutlined />, label: 'Proveedores' },
    { key: '/reportes', icon: <FileTextOutlined />, label: 'Reportes' },
  ]

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar Sesión', onClick: () => { logout(); navigate('/login') } },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
          {!collapsed && 'RHINO 3.0'}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['/']} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>Usuario</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff', minHeight: 280, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
