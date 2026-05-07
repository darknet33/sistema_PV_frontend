import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Sider, Content } = Layout

type MenuItem = {
  key: string
  icon: JSX.Element
  label: string
}

const menuItems: MenuItem[] = [
  { key: '/configuracion/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
  { key: '/configuracion/roles', icon: <TeamOutlined />, label: 'Roles' },
  { key: '/configuracion/modulos', icon: <AppstoreOutlined />, label: 'Módulos' },
  { key: '/configuracion/categorias', icon: <AppstoreOutlined />, label: 'Categorías' },
  { key: '/configuracion/comprobantes', icon: <FileDoneOutlined />, label: 'Comprobantes' },
  { key: '/configuracion/estados', icon: <CheckCircleOutlined />, label: 'Estados' },
]

export default function ConfiguracionesPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey = menuItems.find((item) => location.pathname === item.key)?.key || '/configuracion/usuarios'

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100%', background: 'transparent' }}>
      <Sider width={200} theme="light" style={{ background: '#fff', paddingRight: 8 }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems as MenuProps['items']}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Content style={{ padding: '0 16px' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
