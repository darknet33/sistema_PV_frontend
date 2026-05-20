import { useEffect, useState, useMemo } from 'react'
import { Card, DatePicker, Button, Space, Row, Col, Table, Modal, Statistic, message, Spin, Tag, Input } from 'antd'
import { FilePdfOutlined, ReloadOutlined, ShoppingCartOutlined, ShopOutlined, RiseOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { getProductos } from '../services/productoService'
import categoriaService from '../services/categoriaService'
import { getResumenVentas, getResumenCompras, getTopProductos } from '../services/reporteService'
import type { ResumenVenta, ResumenCompra, TopProducto } from '../services/reporteService'
import type { Categoria } from '../services/categoriaService'
import api from '../services/api'
import type { Producto } from '../types/producto'

const { RangePicker } = DatePicker

export default function ReportesPage() {
  const [fechas, setFechas] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([dayjs().subtract(1, 'month'), dayjs()])
  const [loading, setLoading] = useState(false)

  const [ventas, setVentas] = useState<ResumenVenta[]>([])
  const [compras, setCompras] = useState<ResumenCompra[]>([])
  const [topProductos, setTopProductos] = useState<TopProducto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [kardexProductoId, setKardexProductoId] = useState<number | undefined>(undefined)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)
  const [productoModalVisible, setProductoModalVisible] = useState(false)
  const [productoSearchText, setProductoSearchText] = useState('')

  useEffect(() => {
    getProductos().then((data) => setProductos(Array.isArray(data) ? data : [])).catch(() => {})
    categoriaService.getAll().then((data) => setCategorias(Array.isArray(data) ? data : [])).catch(() => {})
  }, [])

  const formatFecha = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD HH:mm:ss')

  const cargarDatos = async () => {
    if (!fechas[0] || !fechas[1]) {
      message.warning('Seleccione el rango de fechas')
      return
    }
    setLoading(true)
    const fi = formatFecha(fechas[0].startOf('day'))
    const ff = formatFecha(fechas[1].endOf('day'))
    try {
      const [v, c, t] = await Promise.all([
        getResumenVentas(fi, ff),
        getResumenCompras(fi, ff),
        getTopProductos(fi, ff),
      ])
      setVentas(v)
      setCompras(c)
      setTopProductos(t)
    } catch {
      message.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarDatos() }, [])

  const totalVentas = useMemo(() => ventas.reduce((s, v) => s + Number(v.total || 0), 0), [ventas])
  const totalCompras = useMemo(() => compras.reduce((s, c) => s + Number(c.total || 0), 0), [compras])
  const totalUtilidad = useMemo(() => ventas.reduce((s, v) => s + Number(v.utilidad || 0), 0), [ventas])

  const descargarPdf = async (tipo: string, params: Record<string, any> = {}) => {
    setPdfLoading(tipo)
    try {
      const fi = formatFecha((fechas[0] || dayjs().subtract(1, 'month')).startOf('day'))
      const ff = formatFecha((fechas[1] || dayjs()).endOf('day'))
      const response = await api.get(`/reportes/${tipo}/pdf`, {
        params: { fecha_inicio: fi, fecha_fin: ff, ...params },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${tipo.replace('/', '_')}_${dayjs().format('YYYYMMDD')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('PDF generado')
    } catch {
      message.error('Error al generar PDF')
    } finally {
      setPdfLoading(null)
    }
  }

  const descargarKardex = async () => {
    if (!kardexProductoId) {
      message.warning('Seleccione un producto')
      return
    }
    setPdfLoading('kardex')
    try {
      const fi = formatFecha((fechas[0] || dayjs().subtract(1, 'month')).startOf('day'))
      const ff = formatFecha((fechas[1] || dayjs()).endOf('day'))
      const response = await api.get(`/reportes/kardex/${kardexProductoId}`, {
        params: { fecha_inicio: fi, fecha_fin: ff },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `kardex_${kardexProductoId}_${dayjs().format('YYYYMMDD')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Kardex PDF generado')
    } catch {
      message.error('Error al generar Kardex')
    } finally {
      setPdfLoading(null)
    }
  }

  const columnsVentas: ColumnsType<ResumenVenta> = [
    { title: '#', dataIndex: 'venta_id', width: 60 },
    { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm') },
    { title: 'Cliente', dataIndex: 'cliente' },
    { title: 'Comprobante', dataIndex: 'num_comprobante' },
    { title: 'Estado', dataIndex: 'estado', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Subtotal', dataIndex: 'subtotal', render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
    { title: 'Total', dataIndex: 'total', render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
    { title: 'Utilidad', dataIndex: 'utilidad', render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
  ]

  const columnsCompras: ColumnsType<ResumenCompra> = [
    { title: '#', dataIndex: 'compra_id', width: 60 },
    { title: 'Fecha', dataIndex: 'fecha', render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm') },
    { title: 'Proveedor', dataIndex: 'proveedor' },
    { title: 'Comprobante', dataIndex: 'num_comprobante' },
    { title: 'Estado', dataIndex: 'estado', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Total', dataIndex: 'total', render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
  ]

  const columnsTop: ColumnsType<TopProducto> = [
    { title: '#', dataIndex: 'id', width: 60 },
    { title: 'Producto', dataIndex: 'descripcion' },
    { title: 'Total Vendido', dataIndex: 'total_vendido', render: (v: number) => v },
  ]

  const catMap = useMemo(() => {
    const map = new Map<number, string>()
    categorias.forEach((c) => map.set(c.id, c.nombre))
    return map
  }, [categorias])

  const filteredProductos = useMemo(() => {
    if (!productoSearchText) return productos
    const q = productoSearchText.toLowerCase()
    return productos.filter((p) => {
      const catNombre = catMap.get(p.categoria_id) || ''
      return p.codigo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        catNombre.toLowerCase().includes(q)
    })
  }, [productos, productoSearchText, catMap])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Reportes</h2>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <RangePicker
            value={fechas as any}
            onChange={(dates) => setFechas(dates as any)}
          />
          <Button type="primary" icon={<ReloadOutlined />} onClick={cargarDatos} loading={loading}>
            Cargar datos
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Ventas"
                value={totalVentas}
                precision={2}
                prefix={<ShopOutlined />}
                suffix="Bs."
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Compras"
                value={totalCompras}
                precision={2}
                prefix={<ShoppingCartOutlined />}
                suffix="Bs."
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Utilidad en Ventas"
                value={totalUtilidad}
                precision={2}
                prefix={<RiseOutlined />}
                suffix="Bs."
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Ventas" style={{ marginBottom: 16 }} extra={
          <Button
            icon={<FilePdfOutlined />}
            loading={pdfLoading === 'ventas'}
            onClick={() => descargarPdf('ventas')}
            size="small"
          >
            PDF
          </Button>
        }>
          <Table
            columns={columnsVentas}
            dataSource={ventas}
            rowKey="venta_id"
            size="small"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        <Card title="Compras" style={{ marginBottom: 16 }} extra={
          <Button
            icon={<FilePdfOutlined />}
            loading={pdfLoading === 'compras'}
            onClick={() => descargarPdf('compras')}
            size="small"
          >
            PDF
          </Button>
        }>
          <Table
            columns={columnsCompras}
            dataSource={compras}
            rowKey="compra_id"
            size="small"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        <Card title="Productos más vendidos" style={{ marginBottom: 16 }}>
          <Table
            columns={columnsTop}
            dataSource={topProductos}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </Card>

        <Card title="Kardex por producto" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Button
              icon={<SearchOutlined />}
              onClick={() => setProductoModalVisible(true)}
            >
              {kardexProductoId
                ? (() => { const p = productos.find(x => x.id === kardexProductoId); return p ? `[${p.codigo}] ${p.descripcion}` : 'Seleccionar producto' })()
                : 'Seleccionar producto'}
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              loading={pdfLoading === 'kardex'}
              onClick={descargarKardex}
              disabled={!kardexProductoId}
            >
              Generar Kardex PDF
            </Button>
          </Space>
        </Card>
      </Spin>

      <Modal
        title="Seleccionar producto"
        open={productoModalVisible}
        onCancel={() => { setProductoModalVisible(false); setProductoSearchText('') }}
        footer={null}
        width={650}
      >
        <Input.Search
          placeholder="Buscar por código, descripción o marca"
          allowClear
          style={{ marginBottom: 12 }}
          value={productoSearchText}
          onChange={(e) => setProductoSearchText(e.target.value)}
        />
        <Table
          columns={[
            {
              title: 'Producto',
              key: 'producto',
              render: (_, r) => (
                <div>
                  <div><strong>[{r.codigo}]</strong> {catMap.get(r.categoria_id) || ''} - {r.descripcion}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{r.marca}</div>
                </div>
              ),
            },
            { title: 'Stock Actual', dataIndex: 'stock_actual', key: 'stock_actual', width: 100 },
            { title: 'Stock Mínimo', dataIndex: 'stock_minimo', key: 'stock_minimo', width: 100 },
          ]}
          dataSource={filteredProductos}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => {
              setKardexProductoId(record.id)
              setProductoModalVisible(false)
              setProductoSearchText('')
            },
            style: { cursor: 'pointer' },
          })}
        />
      </Modal>
    </div>
  )
}
