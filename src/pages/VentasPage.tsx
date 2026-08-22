import { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Space, Popconfirm, message, Tag, Input, Switch, Grid } from 'antd'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined, PrinterOutlined, CloseCircleOutlined, HistoryOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Venta, VentaCreate } from '../types/venta'
import { getVentas, createVenta, updateVenta, deleteVenta, anularVenta, fetchVentaReportBlob, fetchVentaPdfBlob } from '../services/ventaService'
import { getNotasEntrega, createNotaEntrega, deleteNotaEntrega, fetchNotaEntregaPdfBlob } from '../services/notaEntregaService'
import usePdfPreview from '../hooks/usePdfPreview'
import type { NotaEntrega } from '../types/notaEntrega'
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clienteService'
import comprobanteService from '../services/comprobanteService'
import { getProductos } from '../services/productoService'
import estadoService from '../services/estadoService'
import categoriaService from '../services/categoriaService'
import type { Cliente } from '../types/cliente'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import { calcularPrecioBase } from '../utils/pricing'
import ResponsiveTable from '../components/ResponsiveTable'
import PageHeader from '../components/PageHeader'
import SubCrudSelect from '../components/SubCrudSelect'
import ProductoSelectorModal from '../components/ProductoSelectorModal'

const { useBreakpoint } = Grid

interface DetalleLine {
  key: string
  producto_id: number | null
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number
  precio: number
  costo: number
  utilidad: number
  stock_actual: number
  precioBase: number
}

export default function VentasPage() {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null)
  const [form] = Form.useForm()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [comprobantes, setComprobantes] = useState<{ id: number; nombre: string; numero: number }[]>([])
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [detalles, setDetalles] = useState<DetalleLine[]>([])
  const [numComprobanteAuto, setNumComprobanteAuto] = useState('')
  const [autoNum, setAutoNum] = useState(false)

  const [filterFecha, setFilterFecha] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [searchClienteText, setSearchClienteText] = useState('')
  const [filterEstado, setFilterEstado] = useState<number | undefined>(undefined)

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb']

  const [productoModalVisible, setProductoModalVisible] = useState(false)
  const [selectedDetalleKey, setSelectedDetalleKey] = useState<string | null>(null)

  const [notaModalVisible, setNotaModalVisible] = useState(false)
  const [notaVenta, setNotaVenta] = useState<Venta | null>(null)
  const [notaDetalles, setNotaDetalles] = useState<{ key: string; producto_id: number; producto_codigo: string; producto_nombre: string; producto_categoria: string; cantidadVenta: number; cantidad: number }[]>([])
  const [notaForm] = Form.useForm()
  const [notaGenerando, setNotaGenerando] = useState(false)

  const [notasVisible, setNotasVisible] = useState(false)
  const [notasVenta, setNotasVenta] = useState<Venta | null>(null)
  const [notas, setNotas] = useState<NotaEntrega[]>([])
  const [notasLoading, setNotasLoading] = useState(false)

  const { openPdf, previewModal } = usePdfPreview()

  const clienteOptions = useMemo(() =>
    clientes.filter((c) => c.activo !== false).map((c) => ({ value: c.id, label: c.nombre })),
    [clientes]
  )

  const comprobanteOptions = useMemo(() =>
    comprobantes.map((c) => ({ value: c.id, label: c.nombre })),
    [comprobantes]
  )

  const estadoOptions = useMemo(() =>
    estados.map((e) => ({ value: e.id, label: e.nombre })),
    [estados]
  )

  const catMap = useMemo(() => {
    const map = new Map<number, string>()
    categorias.forEach((c) => map.set(c.id, c.nombre))
    return map
  }, [categorias])

  const loadVentas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getVentas()
      setVentas(data)
    } catch {
      message.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadClientes = useCallback(async () => {
    try {
      const data = await getClientes()
      setClientes(data)
    } catch {
      message.error('Error al cargar clientes')
    }
  }, [])

  const loadComprobantes = useCallback(async () => {
    try {
      const data = await comprobanteService.getAll()
      setComprobantes(data)
    } catch {
      message.error('Error al cargar comprobantes')
    }
  }, [])

  const loadEstados = useCallback(async () => {
    try {
      const data = await estadoService.getAll()
      setEstados(data)
    } catch {
      message.error('Error al cargar estados')
    }
  }, [])

  const loadProductos = useCallback(async () => {
    try {
      const data = await getProductos()
      setProductos(Array.isArray(data) ? data : [])
    } catch {
      message.error('Error al cargar productos')
      setProductos([])
    }
  }, [])

  const loadCategorias = useCallback(async () => {
    try {
      const data = await categoriaService.getAll()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      message.error('Error al cargar categorías')
      setCategorias([])
    }
  }, [])

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadVentas(),
      loadClientes(),
      loadComprobantes(),
      loadEstados(),
      loadProductos(),
      loadCategorias(),
    ])
  }, [loadVentas, loadClientes, loadComprobantes, loadEstados, loadProductos, loadCategorias])

  useEffect(() => { loadAllData() }, [loadAllData])

  const refreshVentas = useCallback(() => {
    loadVentas()
    loadProductos()
  }, [loadVentas, loadProductos])

  useRealtimeRefresh('ventas', refreshVentas)
  useRealtimeRefresh('dashboard', refreshVentas)

  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      if (filterFecha && filterFecha[0] && filterFecha[1]) {
        const fecha = dayjs(v.fecha)
        const inicio = filterFecha[0].startOf('day')
        const fin = filterFecha[1].endOf('day')
        if (fecha.isBefore(inicio) || fecha.isAfter(fin)) return false
      }
      if (searchClienteText) {
        const q = searchClienteText.toLowerCase()
        if (!v.cliente_nombre?.toLowerCase().includes(q)) return false
      }
      if (filterEstado && v.estado_id !== filterEstado) return false
      return true
    })
  }, [ventas, filterFecha, searchClienteText, filterEstado])

  const openCreateModal = async () => {
    await loadProductos()
    setEditingVenta(null)
    setDetalles([{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, stock_actual: 0, precioBase: 0 }])
    setNumComprobanteAuto('')
    setAutoNum(true)
    form.resetFields()
    setModalVisible(true)
  }

  const openEditModal = async (venta: Venta) => {
    await loadProductos()
    setEditingVenta(venta)
    setAutoNum(false)
    form.setFieldsValue({
      fecha: dayjs(venta.fecha),
      cliente_id: venta.cliente_id,
      comprobante_id: venta.comprobante_id,
      num_comprobante: venta.num_comprobante,
      estado_id: venta.estado_id,
      impuesto: Number(venta.impuesto || 0),
      descuento: Number(venta.descuento || 0),
    })
    setNumComprobanteAuto(venta.num_comprobante)
    setDetalles(
      venta.detalles?.map((d, i) => {
        const p = productos.find(p2 => p2.id === d.producto_id)
        const costo = Number(p?.precio || 0)
        const utilidad = Number(d.utilidad || 0)
        const precio = costo + utilidad
        return {
          key: String(i + 1),
          producto_id: d.producto_id,
          producto_nombre: d.producto_nombre,
          producto_codigo: d.producto_codigo,
          producto_categoria: d.producto_categoria || '',
          cantidad: d.cantidad,
          precio,
          costo,
          utilidad,
          stock_actual: p ? p.stock_actual : 0,
          precioBase: calcularPrecioBase(costo, utilidad),
        }
      }) || [{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, stock_actual: 0, precioBase: 0 }]
    )
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const validDetalles = detalles.filter((d) => d.producto_id != null)
      if (validDetalles.length === 0) {
        message.error('Debe agregar al menos un producto')
        return
      }

      const ventaData: VentaCreate = {
        fecha: values.fecha.format('YYYY-MM-DD'),
        cliente_id: values.cliente_id,
        comprobante_id: values.comprobante_id,
        estado_id: values.estado_id,
        impuesto: values.impuesto || 0,
        descuento: values.descuento || 0,
        num_comprobante: autoNum ? undefined : (values.num_comprobante || ''),
        automatico: autoNum,
        detalles: validDetalles.map((d) => ({
          producto_id: d.producto_id!,
          cantidad: d.cantidad,
          precio: d.precio,
          utilidad: d.utilidad,
        })),
      }

      if (editingVenta) {
        ventaData.num_comprobante = values.num_comprobante
        await updateVenta(editingVenta.id, ventaData)
        message.success('Venta actualizada')
      } else {
        await createVenta(ventaData)
        message.success('Venta registrada')
      }

      setModalVisible(false)
      form.resetFields()
      setDetalles([])
      setNumComprobanteAuto('')
      loadVentas()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleAnular = async (id: number) => {
    try {
      await anularVenta(id)
      message.success('Venta anulada')
      loadVentas()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al anular')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVenta(id)
      message.success('Venta eliminada')
      loadVentas()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al eliminar')
    }
  }

  const addDetalleRow = () => {
    setDetalles((prev) => [...prev, { key: String(Date.now()), producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, stock_actual: 0, precioBase: 0 }])
  }

  const removeDetalleRow = (key: string) => {
    setDetalles((prev) => prev.filter((d) => d.key !== key))
  }

  const openProductoModal = (detKey: string) => {
    setSelectedDetalleKey(detKey)
    setProductoModalVisible(true)
  }

  const selectProducto = (producto: Producto) => {
    if (selectedDetalleKey) {
      const costo = Number(producto.precio || 0)
      const utilidad = Number(producto.utilidad || 0)
      const precioBase = calcularPrecioBase(costo, utilidad)
      setDetalles((prev) => prev.map((d) =>
        d.key === selectedDetalleKey
          ? { ...d, producto_id: producto.id, producto_nombre: producto.descripcion, producto_codigo: producto.codigo, producto_categoria: catMap.get(producto.categoria_id) || '', precio: precioBase, costo, utilidad, stock_actual: producto.stock_actual, precioBase }
          : d
      ))
    }
    setProductoModalVisible(false)
    setSelectedDetalleKey(null)
  }

  const updateDetalle = (key: string, field: keyof DetalleLine, value: any) => {
    setDetalles((prev) => prev.map((d) => {
      if (d.key !== key) return d
      const updated = { ...d, [field]: value }
      if (field === 'utilidad') {
        const u = Number(value || 0)
        updated.precio = d.costo + u
      }
      return updated
    }))
  }

  const updateNumComprobanteAuto = (comprobanteId: number | null) => {
    if (!comprobanteId || editingVenta || !autoNum) return
    const comp = comprobantes.find((c) => c.id === comprobanteId)
    if (comp) {
      setNumComprobanteAuto(String(comp.numero).padStart(8, '0'))
    } else {
      setNumComprobanteAuto('')
    }
  }

  const subtotalCalculado = useMemo(() => {
    return detalles.reduce((sum, d) => sum + (d.cantidad || 0) * (d.precio || 0), 0)
  }, [detalles])

  const watchedImpuesto = Form.useWatch('impuesto', form)
  const watchedDescuento = Form.useWatch('descuento', form)
  const impuestoPct = watchedImpuesto
  const descuentoPct = watchedDescuento

  const totalCalculado = useMemo(() => {
    const imp = Number(impuestoPct || 0)
    const desc = Number(descuentoPct || 0)
    return subtotalCalculado + (subtotalCalculado * imp / 100) - (subtotalCalculado * desc / 100)
  }, [subtotalCalculado, impuestoPct, descuentoPct])

  const handleDownloadReport = async () => {
    try {
      const inicio = filterFecha?.[0]?.format('YYYY-MM-DDTHH:mm:ss') || dayjs().startOf('month').format('YYYY-MM-DDTHH:mm:ss')
      const fin = filterFecha?.[1]?.format('YYYY-MM-DDTHH:mm:ss') || dayjs().format('YYYY-MM-DDTHH:mm:ss')
      await openPdf(
        () => fetchVentaReportBlob(inicio, fin, searchClienteText || undefined, filterEstado),
        'Reporte de Ventas',
        `reporte_ventas_${dayjs().format('YYYYMMDD')}.pdf`
      )
    } catch {
      message.error('Error al descargar reporte')
    }
  }

  const handlePrintPdf = async (id: number) => {
    await openPdf(() => fetchVentaPdfBlob(id), `Comprobante de Venta #${id}`, `venta_${id}.pdf`)
  }

  const openNotaModal = (venta: Venta) => {
    setNotaVenta(venta)
    setNotaDetalles(
      (venta.detalles || []).map((d, i) => ({
        key: String(i + 1),
        producto_id: d.producto_id,
        producto_codigo: d.producto_codigo,
        producto_nombre: d.producto_nombre,
        producto_categoria: d.producto_categoria || '',
        cantidadVenta: d.cantidad,
        cantidad: d.cantidad,
      }))
    )
    notaForm.setFieldsValue({
      entregue_nombre: venta.usuario_nombre_completo || venta.usuario_username || '',
      entregue_carnet: '',
      recibi_nombre: venta.cliente_nombre || '',
      recibi_carnet: '',
    })
    setNotaModalVisible(true)
  }

  const updateNotaDetalleCantidad = (key: string, val: number | null) => {
    setNotaDetalles((prev) => prev.map((d) => (d.key === key ? { ...d, cantidad: val || 0 } : d)))
  }

  const notaTotalCantidades = useMemo(() => {
    return notaDetalles.reduce((sum, d) => sum + (d.cantidad || 0), 0)
  }, [notaDetalles])

  const notasVentaTotalCantidad = useMemo(() => {
    return (notasVenta?.detalles || []).reduce((sum, d) => sum + (d.cantidad || 0), 0)
  }, [notasVenta])

  const handleGenerarNota = async () => {
    try {
      const values = await notaForm.validateFields()
      const validDetalles = notaDetalles.filter((d) => d.producto_id != null && d.cantidad > 0)
      if (validDetalles.length === 0) {
        message.error('Debe indicar al menos una cantidad a entregar')
        return
      }
      if (!notaVenta) return
      setNotaGenerando(true)
      const nota = await createNotaEntrega({
        venta_id: notaVenta.id,
        entregue_nombre: values.entregue_nombre,
        entregue_carnet: values.entregue_carnet,
        recibi_nombre: values.recibi_nombre,
        recibi_carnet: values.recibi_carnet,
        detalles: validDetalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad })),
      })
      setNotaModalVisible(false)
      message.success(`Nota de entrega ${nota.numero} generada`)
      openPdf(() => fetchNotaEntregaPdfBlob(nota.id), `Nota de Entrega ${nota.numero}`, `nota_entrega_${nota.numero}.pdf`)
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al generar nota de entrega')
    } finally {
      setNotaGenerando(false)
    }
  }

  const loadNotasVenta = useCallback(async (ventaId: number) => {
    setNotasLoading(true)
    try {
      const data = await getNotasEntrega(ventaId)
      setNotas(data)
    } catch {
      message.error('Error al cargar notas de entrega')
    } finally {
      setNotasLoading(false)
    }
  }, [])

  const openNotasModal = (venta: Venta) => {
    setNotasVenta(venta)
    setNotasVisible(true)
    setNotas([])
    loadNotasVenta(venta.id)
  }

  const handlePrintNotaPdf = async (record: NotaEntrega) => {
    openPdf(() => fetchNotaEntregaPdfBlob(record.id), `Nota de Entrega ${record.numero}`, `nota_entrega_${record.numero}.pdf`)
  }

  const detColumns: ColumnsType<any> = [
    { title: 'Código', dataIndex: 'producto_codigo', key: 'producto_codigo', width: 100 },
    { title: 'Producto', key: 'producto', render: (_: any, r: any) => `${r.producto_categoria ? r.producto_categoria + ' - ' : ''}${r.producto_nombre}` },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: 80 },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', width: 100, render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Subtotal', key: 'subtotal', width: 100, render: (_: any, r: any) => `Bs. ${(r.cantidad * Number(r.precio || 0)).toFixed(2)}` },
  ]

  const notaDetColumns: ColumnsType<any> = [
    { title: 'Código', dataIndex: 'producto_codigo', key: 'producto_codigo', width: 110 },
    { title: 'Producto', key: 'producto', render: (_: any, r: any) => `${r.producto_categoria ? r.producto_categoria + ' - ' : ''}${r.producto_nombre}` },
    { title: 'Cant. en venta', dataIndex: 'cantidadVenta', key: 'cantidadVenta', width: 110 },
    {
      title: 'A entregar', key: 'cantidad', width: 120,
      render: (_: any, r: any) => (
        <InputNumber
          min={0}
          max={r.cantidadVenta}
          className="w-full"
          value={r.cantidad}
          onChange={(val) => updateNotaDetalleCantidad(r.key, val)}
        />
      ),
    },
  ]

  const notasColumns: ColumnsType<NotaEntrega> = [
    { title: 'N°', dataIndex: 'numero', key: 'numero', width: 110 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Total entregado', dataIndex: 'total_cantidad', key: 'total_cantidad', width: 140,
      render: (val: number) => {
        const entregado = Number(val || 0)
        const total = notasVentaTotalCantidad
        const completo = total > 0 && entregado >= total
        return <Tag color={completo ? 'green' : 'orange'}>{entregado} / {total}</Tag>
      },
    },
    { title: 'Generó', dataIndex: 'usuario_username', key: 'usuario_username' },
    {
      title: 'Acciones', key: 'acciones', width: 110,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<PrinterOutlined />} title="Reimprimir" onClick={() => handlePrintNotaPdf(record)} />
          <Popconfirm title="¿Eliminar nota?" onConfirm={async () => {
            try {
              await deleteNotaEntrega(record.id)
              message.success('Nota eliminada')
              if (notasVenta) loadNotasVenta(notasVenta.id)
            } catch (e: any) {
              message.error(e.response?.data?.detail || 'Error al eliminar')
            }
          }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const columns: ColumnsType<Venta> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Cliente', dataIndex: 'cliente_nombre', key: 'cliente_nombre' },
    { title: 'Comprobante', key: 'comprobante', render: (_, r) => `${r.comprobante_nombre} ${r.num_comprobante || ''}` },
    { title: 'Estado', dataIndex: 'estado_nombre', key: 'estado_nombre', render: (val: string) => <Tag>{val}</Tag> },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Imp.', dataIndex: 'impuesto', key: 'impuesto', render: (val: number) => `${Number(val || 0)}%` },
    { title: 'Desc.', dataIndex: 'descuento', key: 'descuento', render: (val: number) => `${Number(val || 0)}%` },
    { title: 'Usuario', dataIndex: 'usuario_username', key: 'usuario_username' },
    {
      title: 'Acciones', key: 'acciones', width: 300, render: (_, record) => (
        <div className="flex gap-1">
          <Button icon={<EditOutlined />} size={isMobile ? 'middle' : 'small'} onClick={() => openEditModal(record)} title="Editar" />
          <Button icon={<EyeOutlined />} size={isMobile ? 'middle' : 'small'} onClick={() => handlePrintPdf(record.id)} title="Vista previa del PDF">
            Vista previa
          </Button>
          <Button icon={<HistoryOutlined />} size={isMobile ? 'middle' : 'small'} onClick={() => openNotasModal(record)} title="Notas de entrega" />
          {record.estado_nombre !== 'Anulado' ? (
            <Popconfirm title="¿Anular venta?" onConfirm={() => handleAnular(record.id)}>
              <Button icon={<CloseCircleOutlined />} size={isMobile ? 'middle' : 'small'} className="!text-amber-500" title="Anular" />
            </Popconfirm>
          ) : (
            <Popconfirm title="¿Eliminar venta?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} size={isMobile ? 'middle' : 'small'} danger title="Eliminar" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ]

  const expandedRowRender = (record: Venta) => {
    return (
      <Table
        columns={detColumns}
        dataSource={record.detalles?.map((d) => ({ ...d, key: d.id }))}
        pagination={false}
        rowKey="id"
        size="small"
        scroll={{ x: 'max-content' }}
      />
    )
  }

  const fabVisible = isMobile && !modalVisible

  return (
    <div className={fabVisible ? 'pb-16' : ''}>
      <PageHeader title="Gestión de Ventas">
        <Button icon={<DownloadOutlined />} size={isMobile ? 'small' : 'middle'} onClick={handleDownloadReport}>
          Reporte PDF
        </Button>
        <Button type="primary" icon={<PlusOutlined />} size={isMobile ? 'middle' : 'middle'} onClick={openCreateModal} className={isMobile ? 'hidden' : ''}>
          Nueva Venta
        </Button>
      </PageHeader>

      <div className="mb-4">
        <div className="flex flex-wrap gap-3 mb-3">
          <DatePicker.RangePicker
            value={filterFecha as any}
            onChange={(dates) => setFilterFecha(dates as any)}
            placeholder={['Fecha inicio', 'Fecha fin']}
          />
          <Input.Search
            placeholder="Buscar por cliente"
            allowClear
            className="max-w-[300px]"
            value={searchClienteText}
            onChange={(e) => setSearchClienteText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag.CheckableTag
            checked={filterEstado === undefined}
            onChange={() => setFilterEstado(undefined)}
            className="!m-0"
          >
            Todos
          </Tag.CheckableTag>
          {estados.map((est, idx) => (
            <Tag.CheckableTag
              key={est.id}
              checked={filterEstado === est.id}
              onChange={() => setFilterEstado(est.id)}
              className="!m-0"
              style={{ backgroundColor: filterEstado === est.id ? colors[idx % colors.length] : undefined }}
            >
              {est.nombre}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>

      <ResponsiveTable
        columns={columns}
        dataSource={filteredVentas}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10, size: isMobile ? 'small' : 'default' }}
        expandable={!isMobile ? { expandedRowRender, rowExpandable: (r) => r.detalles && r.detalles.length > 0 } : undefined}
      />

      {fabVisible && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          className="!fixed bottom-6 right-6 z-50 !w-14 !h-14 !text-2xl shadow-lg"
        />
      )}

      <Modal
        title={editingVenta ? 'Editar Venta' : 'Nueva Venta'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setDetalles([]); setNumComprobanteAuto('') }}
        onOk={handleSave}
        width={720}
        className="responsive-modal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}>
            <DatePicker className="w-full" />
          </Form.Item>

          <div className="flex flex-wrap gap-3">
            <Form.Item name="cliente_id" label="Cliente" rules={[{ required: true }]} className="flex-1 min-w-[180px] !mb-3">
              <SubCrudSelect
                placeholder="Seleccione un cliente"
                options={clienteOptions}
                disabled={editingVenta !== null}
                modalProps={{
                  title: 'Clientes',
                  fetchAll: getClientes,
                  create: createCliente,
                  update: updateCliente,
                  remove: deleteCliente,
                  fields: [
                    { name: 'nombre', label: 'Nombre' },
                    { name: 'nit', label: 'NIT' },
                    { name: 'celular', label: 'Celular' },
                    { name: 'direccion', label: 'Dirección' },
                  ],
                  onDataChange: (list) => setClientes(list),
                }}
              />
            </Form.Item>
            <Form.Item name="comprobante_id" label="Comprobante" rules={[{ required: true }]} className="flex-1 min-w-[130px] !mb-3">
              <SubCrudSelect
                placeholder="Seleccione un comprobante"
                options={comprobanteOptions}
                disabled={editingVenta !== null}
                onChange={(val) => updateNumComprobanteAuto(val as number | null)}
                modalProps={{
                  title: 'Comprobantes',
                  fetchAll: comprobanteService.getAll,
                  create: comprobanteService.create,
                  update: comprobanteService.update,
                  remove: comprobanteService.delete,
                  fields: [
                    { name: 'nombre', label: 'Nombre' },
                    { name: 'numero', label: 'Número', type: 'number' },
                  ],
                  onDataChange: (list) => setComprobantes(list),
                }}
              />
            </Form.Item>
            <Form.Item name="num_comprobante" label="N° Comprobante" className="flex-1 min-w-[160px] !mb-3">
              <Space.Compact className="w-full">
                <Input
                  placeholder={autoNum ? 'Automático' : 'Ingrese número'}
                  value={editingVenta ? undefined : (autoNum ? (numComprobanteAuto || undefined) : undefined)}
                  disabled={editingVenta !== null || autoNum}
                  className="w-full"
                />
                {!editingVenta && (
                  <Switch checkedChildren="A" unCheckedChildren="M" checked={autoNum} onChange={(v) => { setAutoNum(v); if (v) setNumComprobanteAuto('') }} />
                )}
              </Space.Compact>
            </Form.Item>
          </div>

          <Form.Item name="estado_id" label="Estado" rules={[{ required: true }]}>
            <SubCrudSelect
              placeholder="Seleccione un estado"
              options={estadoOptions}
              modalProps={{
                title: 'Estados',
                fetchAll: estadoService.getAll,
                create: estadoService.create,
                update: estadoService.update,
                remove: estadoService.delete,
                fields: [{ name: 'nombre', label: 'Nombre' }],
                onDataChange: (list) => setEstados(list),
              }}
            />
          </Form.Item>

          <div className="flex flex-wrap gap-3">
            <Form.Item name="impuesto" label="Impuesto %" className="flex-1 min-w-[120px]" initialValue={0}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="descuento" label="Descuento %" className="flex-1 min-w-[120px]" initialValue={0}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex justify-between items-center mb-2">
            <strong>Detalles de venta</strong>
            {!editingVenta && numComprobanteAuto && (
              <Tag color="blue">N° Comprobante: {numComprobanteAuto}</Tag>
            )}
          </div>

          {detalles.map((det, index) => (
            <div key={det.key} className="flex flex-wrap gap-2 mb-2 items-start">
              <div className="flex-1 min-w-[140px]">
                <Form.Item label={index === 0 ? 'Producto' : ''} className="!mb-0">
                  <Input.Search
                    placeholder="Buscar producto"
                    value={det.producto_nombre ? `[${det.producto_codigo}] ${det.producto_categoria} - ${det.producto_nombre}` : ''}
                    readOnly
                    onSearch={() => openProductoModal(det.key)}
                    enterButton={<SearchOutlined />}
                  />
                </Form.Item>
              </div>
              <div className="w-[65px] shrink-0">
                <Form.Item label={index === 0 ? 'Cant.' : ''} className="!mb-0">
                  <InputNumber
                    min={1}
                    className="w-full"
                    value={det.cantidad}
                    onChange={(val) => updateDetalle(det.key, 'cantidad', val || 0)}
                  />
                  {det.producto_id && det.cantidad > det.stock_actual && (
                    <div className="text-red-500 text-xs leading-[14px] mt-0.5">
                      Stock: {det.stock_actual}
                    </div>
                  )}
                </Form.Item>
              </div>
              <div className="w-[80px] shrink-0">
                <Form.Item label={index === 0 ? 'Costo' : ''} className="!mb-0">
                  <InputNumber
                    className="w-full"
                    value={det.costo}
                    disabled
                    variant="borderless"
                    prefix="Bs."
                  />
                </Form.Item>
              </div>
              <div className="w-[80px] shrink-0">
                <Form.Item label={index === 0 ? 'Util.' : ''} className="!mb-0">
                  <InputNumber
                    min={0}
                    step={0.01}
                    prefix="Bs."
                    className="w-full"
                    value={det.utilidad}
                    onChange={(val) => updateDetalle(det.key, 'utilidad', val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="w-[90px] shrink-0">
                <Form.Item label={index === 0 ? 'P. Venta' : ''} className="!mb-0">
                  <InputNumber
                    className="w-full"
                    value={det.precio}
                    disabled
                    variant="borderless"
                    prefix="Bs."
                  />
                </Form.Item>
              </div>
              <div className="w-[80px] shrink-0">
                <Form.Item label={index === 0 ? 'Subtotal' : ''} className="!mb-0">
                  <InputNumber
                    className="w-full"
                    value={(det.cantidad || 0) * (det.precio || 0)}
                    disabled
                    variant="borderless"
                  />
                </Form.Item>
              </div>
              {detalles.length > 1 && (
                <div className={index === 0 ? 'pt-[22px]' : ''}>
                  <Button danger icon={<DeleteOutlined />} onClick={() => removeDetalleRow(det.key)} size="small" />
                </div>
              )}
            </div>
          ))}

          <Button type="dashed" onClick={addDetalleRow} className="w-full !mb-3" icon={<PlusOutlined />}>
            Agregar producto
          </Button>

          <div className="text-right font-bold">
            <div className="text-[15px]">Subtotal: Bs. {subtotalCalculado.toFixed(2)}</div>
            {Number(impuestoPct || 0) > 0 && (
              <div className="font-normal text-sm text-blue-500">
                IVA ({impuestoPct}%): Bs. {(subtotalCalculado * Number(impuestoPct || 0) / 100).toFixed(2)}
              </div>
            )}
            {Number(descuentoPct || 0) > 0 && (
              <div className="font-normal text-sm text-green-500">
                Descuento ({descuentoPct}%): -Bs. {(subtotalCalculado * Number(descuentoPct || 0) / 100).toFixed(2)}
              </div>
            )}
            <div className="text-lg mt-1">
              Total: Bs. {totalCalculado.toFixed(2)}
            </div>
          </div>
        </Form>
      </Modal>

      <ProductoSelectorModal
        visible={productoModalVisible}
        onCancel={() => { setProductoModalVisible(false); setSelectedDetalleKey(null) }}
        onSelect={selectProducto}
        showCostInfo
      />

      <Modal
        title={notaVenta ? `Nota de Entrega - Venta #${notaVenta.id}` : 'Nota de Entrega'}
        open={notaModalVisible}
        onCancel={() => { setNotaModalVisible(false); setNotaVenta(null); setNotaDetalles([]) }}
        onOk={handleGenerarNota}
        confirmLoading={notaGenerando}
        okText="Generar nota"
        width={760}
        className="responsive-modal"
      >
        {notaVenta && (
          <div className="mb-3 p-3 rounded border border-gray-200 bg-gray-50 text-sm">
            <div><strong>Cliente:</strong> {notaVenta.cliente_nombre}</div>
            <div><strong>Venta:</strong> {notaVenta.comprobante_nombre} {notaVenta.num_comprobante || ''} - {dayjs(notaVenta.fecha).format('DD/MM/YYYY HH:mm')}</div>
          </div>
        )}
        <div className="mb-2 font-medium">Cantidades a entregar</div>
        <Table
          columns={notaDetColumns}
          dataSource={notaDetalles}
          rowKey="key"
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
        <div className="text-right font-bold mt-2 mb-4 text-[15px]">
          Total de cantidades a entregar: {notaTotalCantidades}
        </div>
        <Form form={notaForm} layout="vertical">
          <div className="flex flex-wrap gap-3">
            <Form.Item name="entregue_nombre" label="Entrega (nombre)" rules={[{ required: true, message: 'Ingrese el nombre' }]} className="flex-1 min-w-[180px]">
              <Input placeholder="Nombre de quien entrega" />
            </Form.Item>
            <Form.Item name="entregue_carnet" label="Entrega (carnet)" rules={[{ required: true, message: 'Ingrese el carnet' }]} className="flex-1 min-w-[150px]">
              <Input placeholder="Carnet de quien entrega" />
            </Form.Item>
          </div>
          <div className="flex flex-wrap gap-3">
            <Form.Item name="recibi_nombre" label="Recibe (nombre)" rules={[{ required: true, message: 'Ingrese el nombre' }]} className="flex-1 min-w-[180px]">
              <Input placeholder="Nombre de quien recibe" />
            </Form.Item>
            <Form.Item name="recibi_carnet" label="Recibe (carnet)" rules={[{ required: true, message: 'Ingrese el carnet' }]} className="flex-1 min-w-[150px]">
              <Input placeholder="Carnet de quien recibe" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={notasVenta ? `Notas de Entrega - ${notasVenta.cliente_nombre}` : 'Notas de Entrega'}
        open={notasVisible}
        onCancel={() => { setNotasVisible(false); setNotasVenta(null); setNotas([]) }}
        width={680}
        className="responsive-modal"
        footer={
          <Space>
            <Button onClick={() => setNotasVisible(false)}>Cerrar</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                const venta = notasVenta
                setNotasVisible(false)
                setNotasVenta(null)
                setNotas([])
                if (venta) openNotaModal(venta)
              }}
            >
              Nueva Nota de Entrega
            </Button>
          </Space>
        }
      >
        <ResponsiveTable
          columns={notasColumns}
          dataSource={notas}
          loading={notasLoading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }}
        />
      </Modal>

      {previewModal}
    </div>
  )
}
