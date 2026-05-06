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

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}>
        <Route path="productos" element={<ProductosPage />} />
        <Route path="compras" element={<ComprasPage />} />
        <Route path="ventas" element={<VentasPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="reportes" element={<ReportesPage />} />
      </Route>
    </Routes>
  )
}

export default App
