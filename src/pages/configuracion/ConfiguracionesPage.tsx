import { Outlet } from 'react-router-dom'
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import SideNav from '../../components/SideNav'

const navItems = [
  { key: '/configuracion/usuarios', icon: <UserOutlined />, label: 'Usuarios' },
  { key: '/configuracion/roles', icon: <TeamOutlined />, label: 'Roles' },
  { key: '/configuracion/modulos', icon: <AppstoreOutlined />, label: 'Módulos' },
  { key: '/configuracion/comprobantes', icon: <FileDoneOutlined />, label: 'Comprobantes' },
  { key: '/configuracion/estados', icon: <CheckCircleOutlined />, label: 'Estados' },
]

export default function ConfiguracionesPage() {
  return (
    <SideNav items={navItems}>
      <Outlet />
    </SideNav>
  )
}
