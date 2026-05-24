import { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Select, Space, Popconfirm, message, Tag, Input, Switch, Grid } from 'antd'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined, PrinterOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Venta, VentaCreate } from '../types/venta'
import { getVentas, createVenta, updateVenta, deleteVenta, anularVenta, downloadVentaReport, downloadVentaPdf } from '../services/ventaService'
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
  peso: number
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

  const [clienteModalVisible, setClienteModalVisible] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [clienteForm] = Form.useForm()

  const [comprobanteModalVisible, setComprobanteModalVisible] = useState(false)
  const [editingComprobante, setEditingComprobante] = useState<any>(null)
  const [comprobanteForm] = Form.useForm()

  const [estadoModalVisible, setEstadoModalVisible] = useState(false)
  const [editingEstado, setEditingEstado] = useState<any>(null)
  const [estadoForm] = Form.useForm()

  const [productoModalVisible, setProductoModalVisible] = useState(false)
  const [selectedDetalleKey, setSelectedDetalleKey] = useState<string | null>(null)
  const [productoSearchText, setProductoSearchText] = useState('')

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

  const productosActivos = useMemo(() =>
    productos.filter((p) => p.activo !== false),
    [productos]
  )

  const filteredProductos = useMemo(() => {
    const base = productosActivos
    if (!productoSearchText) return base
    const q = productoSearchText.toLowerCase()
    return base.filter((p) => {
      const catNombre = catMap.get(p.categoria_id) || ''
      return p.codigo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        catNombre.toLowerCase().includes(q)
    })
  }, [productosActivos, productoSearchText, catMap])

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
    setDetalles([{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, peso: 0, stock_actual: 0, precioBase: 0 }])
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
        const peso = Number(p?.peso || 0)
        const precio = peso === 0 ? costo + utilidad : peso * costo + utilidad
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
          peso,
          stock_actual: p ? p.stock_actual : 0,
          precioBase: calcularPrecioBase(costo, utilidad, peso),
        }
      }) || [{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, peso: 0, stock_actual: 0, precioBase: 0 }]
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
    setDetalles((prev) => [...prev, { key: String(Date.now()), producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, precio: 0, costo: 0, utilidad: 0, peso: 0, stock_actual: 0, precioBase: 0 }])
  }

  const removeDetalleRow = (key: string) => {
    setDetalles((prev) => prev.filter((d) => d.key !== key))
  }

  const openProductoModal = (detKey: string) => {
    setSelectedDetalleKey(detKey)
    setProductoSearchText('')
    setProductoModalVisible(true)
  }

  const selectProducto = (producto: Producto) => {
    if (selectedDetalleKey) {
      const costo = Number(producto.precio || 0)
      const utilidad = Number(producto.utilidad || 0)
      const peso = Number(producto.peso || 0)
      const precioBase = calcularPrecioBase(costo, utilidad, peso)
      setDetalles((prev) => prev.map((d) =>
        d.key === selectedDetalleKey
          ? { ...d, producto_id: producto.id, producto_nombre: producto.descripcion, producto_codigo: producto.codigo, producto_categoria: catMap.get(producto.categoria_id) || '', precio: precioBase, costo, utilidad, peso, stock_actual: producto.stock_actual, precioBase }
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
        updated.precio = d.peso === 0 ? d.costo + u : d.peso * d.costo + u
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
      await downloadVentaReport(inicio, fin, searchClienteText || undefined, filterEstado)
      message.success('Reporte descargado')
    } catch {
      message.error('Error al descargar reporte')
    }
  }

  const handlePrintPdf = async (id: number) => {
    try {
      await downloadVentaPdf(id)
      message.success('PDF descargado')
    } catch {
      message.error('Error al generar PDF')
    }
  }

  const detColumns: ColumnsType<any> = [
    { title: 'Código', dataIndex: 'producto_codigo', key: 'producto_codigo', width: 100 },
    { title: 'Producto', key: 'producto', render: (_: any, r: any) => `${r.producto_categoria ? r.producto_categoria + ' - ' : ''}${r.producto_nombre}` },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: 80 },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', width: 100, render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Subtotal', key: 'subtotal', width: 100, render: (_: any, r: any) => `Bs. ${(r.cantidad * Number(r.precio || 0)).toFixed(2)}` },
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
      title: 'Acciones', key: 'acciones', width: 200, render: (_, record) => (
        <div className="flex gap-1">
          <Button icon={<EditOutlined />} size={isMobile ? 'middle' : 'small'} onClick={() => openEditModal(record)} />
          <Button icon={<PrinterOutlined />} size={isMobile ? 'middle' : 'small'} onClick={() => handlePrintPdf(record.id)} />
          {record.estado_nombre !== 'Anulado' ? (
            <Popconfirm title="¿Anular venta?" onConfirm={() => handleAnular(record.id)}>
              <Button icon={<CloseCircleOutlined />} size={isMobile ? 'middle' : 'small'} className="!text-amber-500" />
            </Popconfirm>
          ) : (
            <Popconfirm title="¿Eliminar venta?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} size={isMobile ? 'middle' : 'small'} danger />
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

  const productoColumns: ColumnsType<Producto> = [
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
    { title: 'Peso (kg)', dataIndex: 'peso', key: 'peso', width: 80, render: (val: number) => Number(val || 0).toFixed(2) },
    { title: 'Costo Bs.', dataIndex: 'precio', key: 'precio', width: 90, render: (val: number) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Utilidad Bs.', dataIndex: 'utilidad', key: 'utilidad', width: 90, render: (val: number) => `Bs. ${Number(val || 0).toFixed(2)}` },
    {
      title: 'Precio Base', key: 'precio_base', width: 100,
      render: (_, r) => {
        const pb = calcularPrecioBase(Number(r.precio || 0), Number(r.utilidad || 0), Number(r.peso || 0))
        return `Bs. ${pb.toFixed(2)}`
      },
    },
    { title: 'Stock', dataIndex: 'stock_actual', key: 'stock_actual', width: 60 },
  ]

  const clienteColumns: ColumnsType<Cliente> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'NIT', dataIndex: 'nit' },
    { title: 'Celular', dataIndex: 'celular' },
    { title: 'Dirección', dataIndex: 'direccion' },
    {
      title: 'Acciones', width: 120,
      render: (_: unknown, record: Cliente) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingCliente(record); clienteForm.setFieldsValue(record); setClienteModalVisible(true) }} />
          <Popconfirm title="¿Eliminar cliente?" onConfirm={async () => { try { await deleteCliente(record.id); message.success('Cliente eliminado'); loadClientes() } catch (e: any) { message.error(e.response?.data?.detail || 'Error al eliminar') } }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const comprobanteSubColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'Número', dataIndex: 'numero' },
    {
      title: 'Acciones', width: 120,
      render: (_: unknown, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingComprobante(record); comprobanteForm.setFieldsValue(record); setComprobanteModalVisible(true) }} />
          <Popconfirm title="¿Eliminar comprobante?" onConfirm={async () => { try { await comprobanteService.delete(record.id); message.success('Comprobante eliminado'); loadComprobantes() } catch (e: any) { message.error(e.response?.data?.detail || 'Error al eliminar') } }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const estadoSubColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones', width: 120,
      render: (_: unknown, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingEstado(record); estadoForm.setFieldsValue(record); setEstadoModalVisible(true) }} />
          <Popconfirm title="¿Eliminar estado?" onConfirm={async () => { try { await estadoService.delete(record.id); message.success('Estado eliminado'); loadEstados() } catch (e: any) { message.error(e.response?.data?.detail || 'Error al eliminar') } }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
              <Select
                showSearch
                placeholder="Seleccione un cliente"
                filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
                options={clienteOptions}
                disabled={editingVenta !== null}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div className="p-2 border-t border-gray-100">
                      <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingCliente(null); clienteForm.resetFields(); setClienteModalVisible(true) }}>
                        Gestionar clientes
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
            <Form.Item name="comprobante_id" label="Comprobante" rules={[{ required: true }]} className="flex-1 min-w-[130px] !mb-3">
              <Select
                placeholder="Seleccione un comprobante"
                options={comprobanteOptions}
                disabled={editingVenta !== null}
                onChange={(val) => updateNumComprobanteAuto(val)}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div className="p-2 border-t border-gray-100">
                      <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingComprobante(null); comprobanteForm.resetFields(); setComprobanteModalVisible(true) }}>
                        Gestionar comprobantes
                      </Button>
                    </div>
                  </>
                )}
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
            <Select
              placeholder="Seleccione un estado"
              options={estadoOptions}
              popupRender={(menu) => (
                <>
                  {menu}
                  <div className="p-2 border-t border-gray-100">
                    <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingEstado(null); estadoForm.resetFields(); setEstadoModalVisible(true) }}>
                      Gestionar estados
                    </Button>
                  </div>
                </>
              )}
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

      <Modal
        title="Seleccionar producto"
        open={productoModalVisible}
        onCancel={() => { setProductoModalVisible(false); setSelectedDetalleKey(null) }}
        footer={null}
        width={700}
        className="responsive-modal"
      >
        <Input.Search
          placeholder="Buscar por código, descripción o marca"
          allowClear
          className="mb-3"
          value={productoSearchText}
          onChange={(e) => setProductoSearchText(e.target.value)}
        />
        <Table
          columns={productoColumns}
          dataSource={filteredProductos}
          rowKey="id"
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => selectProducto(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Modal>

      <Modal
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        open={clienteModalVisible}
        onCancel={() => setClienteModalVisible(false)}
        onOk={async () => {
          try {
            const values = await clienteForm.validateFields()
            if (editingCliente) {
              await updateCliente(editingCliente.id, values)
              message.success('Cliente actualizado')
            } else {
              await createCliente(values)
              message.success('Cliente creado')
            }
            setClienteModalVisible(false)
            loadClientes()
          } catch {
            message.error('Error al guardar cliente')
          }
        }}
        width={500}
        className="responsive-modal"
      >
        <Form form={clienteForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nit" label="NIT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="celular" label="Celular" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="direccion" label="Dirección" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
        <ResponsiveTable
          columns={clienteColumns}
          dataSource={clientes}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      <Modal
        title={editingComprobante ? 'Editar Comprobante' : 'Nuevo Comprobante'}
        open={comprobanteModalVisible}
        onCancel={() => setComprobanteModalVisible(false)}
        onOk={async () => {
          try {
            const values = await comprobanteForm.validateFields()
            if (editingComprobante) {
              await comprobanteService.update(editingComprobante.id, values)
              message.success('Comprobante actualizado')
            } else {
              await comprobanteService.create(values)
              message.success('Comprobante creado')
            }
            setComprobanteModalVisible(false)
            loadComprobantes()
          } catch {
            message.error('Error al guardar comprobante')
          }
        }}
        className="responsive-modal"
      >
        <Form form={comprobanteForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="numero" label="Número inicial" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
        <ResponsiveTable
          columns={comprobanteSubColumns}
          dataSource={comprobantes}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      <Modal
        title={editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
        open={estadoModalVisible}
        onCancel={() => setEstadoModalVisible(false)}
        onOk={async () => {
          try {
            const values = await estadoForm.validateFields()
            if (editingEstado) {
              await estadoService.update(editingEstado.id, values)
              message.success('Estado actualizado')
            } else {
              await estadoService.create(values)
              message.success('Estado creado')
            }
            setEstadoModalVisible(false)
            loadEstados()
          } catch {
            message.error('Error al guardar estado')
          }
        }}
        className="responsive-modal"
      >
        <Form form={estadoForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
        <ResponsiveTable
          columns={estadoSubColumns}
          dataSource={estados}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  )
}
