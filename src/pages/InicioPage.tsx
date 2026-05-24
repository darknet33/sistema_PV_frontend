import { useEffect, useState, useMemo, useCallback } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Spin, message } from 'antd'
import {
  ShoppingCartOutlined,
  ShopOutlined,
  WarningOutlined,
  UserOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import './InicioPage.css'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'

interface DashboardData {
  resumen_hoy: {
    ventas_cantidad: number
    ventas_total: number
    compras_cantidad: number
    compras_total: number
  }
  ventas_por_dia: { fecha: string; cantidad: number; total: number }[]
  compras_por_dia: { fecha: string; cantidad: number; total: number }[]
  top_vendedores: { username: string; cantidad: number; total: number }[]
  stock_bajo: { id: number; codigo: string; descripcion: string; marca: string; stock_actual: number; stock_minimo: number }[]
}

const formatCurrency = (v: number) => `Bs. ${Number(v || 0).toFixed(2)}`

export default function InicioPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const usuario = useAuthStore((s) => s.usuario)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    api.get('/reportes/dashboard')
      .then((res) => setData(res.data))
      .catch(() => message.error('Error al cargar dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const refreshDashboard = useCallback(() => {
    api.get('/reportes/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useRealtimeRefresh('dashboard', refreshDashboard)

  const chartData = useMemo(() => {
    if (!data) return []
    const fechaMap = new Map<string, { fecha: string; ventas: number; compras: number }>()
    for (const v of data.ventas_por_dia) {
      const entry = fechaMap.get(v.fecha) || { fecha: v.fecha, ventas: 0, compras: 0 }
      entry.ventas = Number(v.total)
      fechaMap.set(v.fecha, entry)
    }
    for (const c of data.compras_por_dia) {
      const entry = fechaMap.get(c.fecha) || { fecha: c.fecha, ventas: 0, compras: 0 }
      entry.compras = Number(c.total)
      fechaMap.set(c.fecha, entry)
    }
    return Array.from(fechaMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [data])

  const stockColumns: ColumnsType<DashboardData['stock_bajo'][0]> = [
    { title: 'Código', dataIndex: 'codigo', width: 80 },
    {
      title: 'Producto',
      key: 'producto',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.descripcion}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.marca}</div>
        </div>
      ),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'stock_actual',
      width: 110,
      render: (v: number) => (
        <Tag color="red" className="stock-alert-tag">
          <WarningOutlined /> {v}
        </Tag>
      ),
    },
    { title: 'Stock Mínimo', dataIndex: 'stock_minimo', width: 100 },
  ]

  const vendedorColumns: ColumnsType<DashboardData['top_vendedores'][0]> = [
    {
      title: 'Usuario',
      dataIndex: 'username',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    { title: 'Ventas', dataIndex: 'cantidad', width: 80 },
    {
      title: 'Total',
      dataIndex: 'total',
      width: 130,
      render: (v: number) => formatCurrency(v),
    },
  ]

  const formatFecha = (f: string) => dayjs(f).format('DD/MM')

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100%', margin: -24, padding: 24 }}>
      <div className="dashboard-welcome">
        <h2>👋 Bienvenido, {usuario?.nombres || 'Usuario'}</h2>
        <span>{dayjs().format('dddd, D [de] MMMM [del] YYYY')}</span>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          {
            key: 'ventas',
            class: 'card-ventas',
            icon: <ShopOutlined />,
            title: 'Ventas hoy',
            value: data?.resumen_hoy.ventas_total || 0,
            suffix: 'Bs.',
            subtext: `${data?.resumen_hoy.ventas_cantidad || 0} transacciones`,
            precision: 2,
          },
          {
            key: 'compras',
            class: 'card-compras',
            icon: <ShoppingCartOutlined />,
            title: 'Compras hoy',
            value: data?.resumen_hoy.compras_total || 0,
            suffix: 'Bs.',
            subtext: `${data?.resumen_hoy.compras_cantidad || 0} transacciones`,
            precision: 2,
          },
          {
            key: 'stock',
            class: 'card-stock',
            icon: <WarningOutlined />,
            title: 'Stock bajo',
            value: data?.stock_bajo.length || 0,
            suffix: '',
            subtext: 'productos por debajo del mínimo',
          },
          {
            key: 'vendedor',
            class: 'card-vendedor',
            icon: <UserOutlined />,
            title: 'Mejor vendedor (30d)',
            value: data?.top_vendedores[0]?.username || '-',
            suffix: '',
            subtext: data?.top_vendedores[0]
              ? formatCurrency(data.top_vendedores[0].total)
              : '',
          },
        ].map((card) => (
          <Col xs={24} sm={12} md={6} key={card.key}>
            <Card className={`dashboard-card ${card.class}`} variant="borderless">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Statistic
                  title={card.title}
                  value={card.key === 'vendedor' ? undefined : card.value}
                  valueStyle={{ fontSize: card.key === 'vendedor' ? 20 : 28, fontWeight: 600 }}
                  precision={card.precision}
                  suffix={card.suffix}
                />
                <div className="icon-circle">{card.icon}</div>
              </div>
              {card.key === 'vendedor' && (
                <div style={{ fontSize: 22, fontWeight: 600 }}>{card.value}</div>
              )}
              <div className="card-subtext">
                {card.key !== 'vendedor' && (
                  <ArrowUpOutlined style={{ marginRight: 4 }} />
                )}
                {card.subtext}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>Ventas vs Compras (últimos 30 días)</span>}
        className="dashboard-chart-card"
        style={{ marginBottom: 16 }}
        variant="borderless"
      >
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="fecha" tickFormatter={formatFecha} fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `Bs.${v}`} />
            <Tooltip labelFormatter={(f) => dayjs(f).format('DD/MM/YYYY')} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value: string) => (
                <span style={{ color: '#333', fontWeight: 500 }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="ventas"
              name="Ventas"
              stroke="#1890ff"
              strokeWidth={3}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="compras"
              name="Compras"
              stroke="#52c41a"
              strokeWidth={3}
              dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Productos con stock bajo</span>}
            className="dashboard-table-card"
            variant="borderless"
          >
            <Table
              columns={stockColumns}
              dataSource={data?.stock_bajo || []}
              rowKey="id"
              size="middle"
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 5, size: 'small' }}
              rowClassName={() => 'dashboard-row'}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Top vendedores (30 días)</span>}
            className="dashboard-table-card"
            variant="borderless"
          >
            <Table
              columns={vendedorColumns}
              dataSource={data?.top_vendedores || []}
              rowKey="username"
              size="middle"
              scroll={{ x: 'max-content' }}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
