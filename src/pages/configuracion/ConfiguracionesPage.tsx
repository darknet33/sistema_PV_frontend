import { Outlet } from 'react-router-dom'
import {
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import SideNav from '../../components/SideNav'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { key: '/configuracion/empresa', icon: <ShopOutlined />, label: 'Empresa', modulo: 'Empresa' },
  { key: '/configuracion/usuarios', icon: <UserOutlined />, label: 'Usuarios', modulo: 'Usuarios' },
  { key: '/configuracion/roles', icon: <TeamOutlined />, label: 'Roles', modulo: 'Roles' },
  { key: '/configuracion/modulos', icon: <AppstoreOutlined />, label: 'Módulos', modulo: 'Modulos' },
  { key: '/configuracion/comprobantes', icon: <FileDoneOutlined />, label: 'Comprobantes', modulo: 'Comprobantes' },
  { key: '/configuracion/estados', icon: <CheckCircleOutlined />, label: 'Estados', modulo: 'Estados' },
]

export default function ConfiguracionesPage() {
  const modulos = useAuthStore((state) => state.modulos)
  const nombres = new Set(modulos.map((m) => m.nombre))
  const items = navItems.filter((item) => nombres.has(item.modulo)).map(({ modulo: _modulo, ...rest }) => rest)

  return (
    <SideNav items={items}>
      <Outlet />
    </SideNav>
  )
}
