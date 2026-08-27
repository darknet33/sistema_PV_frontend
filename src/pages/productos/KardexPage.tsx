import { useState, useMemo } from 'react'
import { Card, DatePicker, Button, Space, Row, Col, Table, Statistic, Empty, Tag, message, Spin, Descriptions, Image as AntImage } from 'antd'
import { FilePdfOutlined, SearchOutlined, SwapOutlined, PictureOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '../../components/PageHeader'
import ProductoSelectorModal from '../../components/ProductoSelectorModal'
import { getKardexMovimientos } from '../../services/reporteService'
import type { KardexMovimiento, KardexResponse } from '../../types/reporte'
import usePdfPreview from '../../hooks/usePdfPreview'
import { resolveUrl } from '../../utils/resolveUrl'
import api from '../../services/api'
import type { Producto } from '../../types/producto'

const { RangePicker } = DatePicker

export default function KardexPage() {
  const { openPdf, previewModal } = usePdfPreview()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [data, setData] = useState<KardexResponse | null>(null)
  const [fechas, setFechas] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
  const [selectorVisible, setSelectorVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const formatFecha = (d: dayjs.Dayjs) => d.format('YYYY-MM-DD HH:mm:ss')

  const cargarKardex = async (prod: Producto, fi?: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
    setLoading(true)
    try {
      const fechaInicio = fi?.[0] ? formatFecha(fi[0].startOf('day')) : undefined
      const fechaFin = fi?.[1] ? formatFecha(fi[1].endOf('day')) : undefined
      const result = await getKardexMovimientos(prod.id, fechaInicio, fechaFin)
      setData(result)
    } catch {
      message.error('Error al cargar los movimientos')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProducto = (prod: Producto) => {
    setProducto(prod)
    setData(null)
    cargarKardex(prod, fechas)
  }

  const handleRangeChange = (dates: any) => {
    setFechas(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
    if (producto) cargarKardex(producto, dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
  }

  const descargarPdf = async () => {
    if (!producto) return
    setPdfLoading(true)
    try {
      const params: Record<string, string> = {}
      if (fechas[0] && fechas[1]) {
        params.fecha_inicio = formatFecha(fechas[0].startOf('day'))
        params.fecha_fin = formatFecha(fechas[1].endOf('day'))
      }
      const response = await api.get(`/reportes/kardex/${producto.id}`, {
        params,
        responseType: 'blob',
      })
      const blob = response.data as Blob
      await openPdf(
        () => Promise.resolve(blob),
        `Kardex - ${producto.descripcion}`,
        `kardex_${producto.id}_${dayjs().format('YYYYMMDD')}.pdf`
      )
    } catch {
      message.error('Error al generar PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const resumen = useMemo(() => {
    const movs = data?.movimientos ?? []
    const entradas = movs.filter((m) => m.tipo === 'ENTRADA')
    const salidas = movs.filter((m) => m.tipo === 'SALIDA')
    return {
      totalEntradas: entradas.reduce((s, m) => s + Number(m.cantidad || 0), 0),
      totalSalidas: salidas.reduce((s, m) => s + Number(m.cantidad || 0), 0),
      saldoFinal: movs.length > 0 ? movs[movs.length - 1].saldo : 0,
    }
  }, [data])

  const columns: ColumnsType<KardexMovimiento> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      width: 160,
      render: (v: string, r) =>
        r.tipo === 'SALDO INICIAL' ? '-' : dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      width: 130,
      render: (v: string) => {
        if (v === 'ENTRADA') return <Tag color="green">ENTRADA</Tag>
        if (v === 'SALIDA') return <Tag color="red">SALIDA</Tag>
        return <Tag>SALDO INICIAL</Tag>
      },
    },
    { title: 'Comprobante', dataIndex: 'detalle' },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      width: 110,
      align: 'right' as const,
      render: (v: number, r) => (r.tipo === 'SALDO INICIAL' ? '-' : `${v} ${data?.producto?.unidad_principal?.unidad_abreviatura || ''}`),
    },
    {
      title: 'Precio/Costo Bs.',
      dataIndex: 'precio',
      width: 140,
      align: 'right' as const,
      render: (v: number, r) => (r.tipo === 'SALDO INICIAL' ? '-' : `Bs. ${Number(v || 0).toFixed(2)}`),
    },
    {
      title: 'Saldo',
      dataIndex: 'saldo',
      width: 110,
      align: 'right' as const,
      render: (v: number) => Number(v || 0),
    },
  ]

  return (
    <div>
      <PageHeader title="Kardex">
        <Space wrap>
          <RangePicker
            value={fechas as any}
            onChange={handleRangeChange}
            allowClear
          />
          <Button icon={<SearchOutlined />} onClick={() => setSelectorVisible(true)}>
            {producto ? `[${producto.codigo}] ${producto.descripcion}` : 'Seleccionar producto'}
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            loading={pdfLoading}
            onClick={descargarPdf}
            disabled={!producto}
          >
            PDF
          </Button>
        </Space>
      </PageHeader>

      <Card style={{ marginBottom: 16 }}>
        {!producto ? (
          <Empty description="Seleccione un producto para ver sus movimientos">
            <Button type="primary" icon={<SearchOutlined />} onClick={() => setSelectorVisible(true)}>
              Seleccionar producto
            </Button>
          </Empty>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              {data?.producto.imagen ? (
                <AntImage
                  src={resolveUrl(data.producto.imagen)}
                  alt={data.producto.descripcion}
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  fallback="/logo.png"
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    color: '#bfbfbf',
                    flexShrink: 0,
                  }}
                >
                  <PictureOutlined style={{ fontSize: 40 }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {`[${data?.producto.codigo ?? producto.codigo}] ${data?.producto.descripcion ?? producto.descripcion}`}
                </div>
                <div style={{ marginBottom: 12 }}>
                  {data?.producto.activo === false ? <Tag color="red">INACTIVO</Tag> : <Tag color="green">ACTIVO</Tag>}
                  {data?.producto.categoria && <Tag>{data.producto.categoria}</Tag>}
                </div>
                <Descriptions
                  size="small"
                  column={{ xs: 2, sm: 3, md: 3 }}
                  items={[
                    { key: 'marca', label: 'Marca', children: data?.producto.marca ?? '-' },
                    { key: 'procedencia', label: 'Procedencia', children: data?.producto.procedencia || '-' },
                    { key: 'costo', label: 'Costo Bs.', children: `Bs. ${Number(data?.producto.precio ?? 0).toFixed(2)}` },
                    { key: 'utilidad', label: 'Utilidad Bs.', children: `Bs. ${Number(data?.producto.utilidad ?? 0).toFixed(2)}` },
                    { key: 'stock_ini', label: 'Stock Inicial', children: `${data?.producto.stock_inicial ?? '-'} ${data?.producto?.unidad_principal?.unidad_abreviatura || ''}` },
                    {
                      key: 'stock_act',
                      label: 'Stock Actual',
                      children: <strong>{`${data?.producto.stock_actual ?? '-'} ${data?.producto?.unidad_principal?.unidad_abreviatura || ''}`}</strong>,
                    },
                    { key: 'stock_min', label: 'Stock Mínimo', children: `${data?.producto.stock_minimo ?? '-'} ${data?.producto?.unidad_principal?.unidad_abreviatura || ''}` },
                    { key: 'stock_max', label: 'Stock Máximo', children: `${data?.producto.stock_maximo ?? '-'} ${data?.producto?.unidad_principal?.unidad_abreviatura || ''}` },
                  ]}
                />
              </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic title="Total Entradas" value={resumen.totalEntradas} prefix={<SwapOutlined />} valueStyle={{ color: '#3f8600' }} />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic title="Total Salidas" value={resumen.totalSalidas} valueStyle={{ color: '#cf1322' }} />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic title="Saldo Final" value={resumen.saldoFinal} />
                </Card>
              </Col>
            </Row>

            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={data?.movimientos ?? []}
                rowKey={(r) => `${r.fecha}-${r.tipo}-${r.detalle}-${r.saldo}`}
                size="small"
                scroll={{ x: 'max-content' }}
                pagination={{ pageSize: 15 }}
                locale={{ emptyText: 'Sin movimientos en el período seleccionado' }}
              />
            </Spin>
          </>
        )}
      </Card>

      <ProductoSelectorModal
        visible={selectorVisible}
        onCancel={() => setSelectorVisible(false)}
        onSelect={handleSelectProducto}
      />
      {previewModal}
    </div>
  )
}
