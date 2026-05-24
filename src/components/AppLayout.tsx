import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Drawer, Grid } from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = Layout
const { useBreakpoint } = Grid

interface AppLayoutProps {
  menuItems: MenuProps['items']
  children: ReactNode
}

export default function AppLayout({ menuItems, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)
  const usuario = useAuthStore((state) => state.usuario)
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const handleMenuClick = (key: string) => {
    navigate(key)
    if (isMobile) setMobileDrawerOpen(false)
  }

  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

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

  const siderContent = (
    <>
      <div className="h-16 flex items-center justify-center text-white font-bold text-xl">
        {!isMobile && !collapsed && 'RHINO 3.0'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={[]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
      />
    </>
  )

  return (
    <Layout className="min-h-screen">
      {isMobile ? (
        <Drawer
          title="RHINO 3.0"
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          styles={{ body: { padding: 0 } }}
          width={260}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ borderInlineEnd: 0 }}
          />
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
          {siderContent}
        </Sider>
      )}
      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileDrawerOpen(true) : setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="max-md:hidden">{usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="bg-white overflow-auto p-4 md:p-6 max-md:!p-3 max-sm:!p-2">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
