import { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Select, Space, Popconfirm, message, Tag, Input, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined, PrinterOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Compra, CompraCreate } from '../types/compra'
import { getCompras, createCompra, updateCompra, deleteCompra, downloadCompraReport, downloadCompraPdf } from '../services/compraService'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/proveedorService'
import comprobanteService from '../services/comprobanteService'
import { getProductos } from '../services/productoService'
import estadoService from '../services/estadoService'
import categoriaService from '../services/categoriaService'
import type { Proveedor } from '../types/proveedor'
import type { Producto } from '../types/producto'
import type { Categoria } from '../services/categoriaService'

interface DetalleLine {
  key: string
  producto_id: number | null
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number
  costo: number
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null)
  const [form] = Form.useForm()

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [comprobantes, setComprobantes] = useState<{ id: number; nombre: string; numero: number }[]>([])
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [detalles, setDetalles] = useState<DetalleLine[]>([])
  const [numComprobanteAuto, setNumComprobanteAuto] = useState('')
  const [autoNum, setAutoNum] = useState(true)

  const [filterFecha, setFilterFecha] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [searchProveedorText, setSearchProveedorText] = useState('')
  const [filterEstado, setFilterEstado] = useState<number | undefined>(undefined)

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb']

  const [proveedorModalVisible, setProveedorModalVisible] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [proveedorForm] = Form.useForm()

  const [comprobanteModalVisible, setComprobanteModalVisible] = useState(false)
  const [editingComprobante, setEditingComprobante] = useState<any>(null)
  const [comprobanteForm] = Form.useForm()

  const [estadoModalVisible, setEstadoModalVisible] = useState(false)
  const [editingEstado, setEditingEstado] = useState<any>(null)
  const [estadoForm] = Form.useForm()

  const [productoModalVisible, setProductoModalVisible] = useState(false)
  const [selectedDetalleKey, setSelectedDetalleKey] = useState<string | null>(null)
  const [productoSearchText, setProductoSearchText] = useState('')

  const proveedorOptions = useMemo(() =>
    proveedores.filter((p) => p.activo !== false).map((p) => ({ value: p.id, label: p.nombre })),
    [proveedores]
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

  const loadCompras = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCompras()
      setCompras(data)
    } catch {
      message.error('Error al cargar compras')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProveedores = useCallback(async () => {
    try {
      const data = await getProveedores()
      setProveedores(data)
    } catch {
      message.error('Error al cargar proveedores')
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
      loadCompras(),
      loadProveedores(),
      loadComprobantes(),
      loadEstados(),
      loadProductos(),
      loadCategorias(),
    ])
  }, [loadCompras, loadProveedores, loadComprobantes, loadEstados, loadProductos, loadCategorias])

  useEffect(() => { loadAllData() }, [loadAllData])

  const filteredCompras = useMemo(() => {
    return compras.filter((c) => {
      if (filterFecha && filterFecha[0] && filterFecha[1]) {
        const fecha = dayjs(c.fecha)
        const inicio = filterFecha[0].startOf('day')
        const fin = filterFecha[1].endOf('day')
        if (fecha.isBefore(inicio) || fecha.isAfter(fin)) return false
      }
      if (searchProveedorText) {
        const q = searchProveedorText.toLowerCase()
        if (!c.proveedor_nombre?.toLowerCase().includes(q)) return false
      }
      if (filterEstado && c.estado_id !== filterEstado) return false
      return true
    })
  }, [compras, filterFecha, searchProveedorText, filterEstado])

  const openCreateModal = () => {
    setEditingCompra(null)
    setDetalles([{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, costo: 0 }])
    setNumComprobanteAuto('')
    setAutoNum(true)
    form.resetFields()
    setModalVisible(true)
  }

  const openEditModal = (compra: Compra) => {
    setEditingCompra(compra)
    setAutoNum(false)
    form.setFieldsValue({
      fecha: dayjs(compra.fecha),
      proveedor_id: compra.proveedor_id,
      comprobante_id: compra.comprobante_id,
      num_comprobante: compra.num_comprobante,
      estado_id: compra.estado_id,
    })
    setNumComprobanteAuto(compra.num_comprobante)
    setDetalles(
      compra.detalles?.map((d, i) => ({
        key: String(i + 1),
        producto_id: d.producto_id,
        producto_nombre: d.producto_nombre,
        producto_codigo: d.producto_codigo,
        producto_categoria: d.producto_categoria || '',
        cantidad: d.cantidad,
        costo: Number(d.costo),
      })) || [{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, costo: 0 }]
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

      const compraData: CompraCreate = {
        fecha: values.fecha.format('YYYY-MM-DD'),
        proveedor_id: values.proveedor_id,
        comprobante_id: values.comprobante_id,
        estado_id: values.estado_id,
        num_comprobante: autoNum ? undefined : (values.num_comprobante || ''),
        automatico: autoNum,
        detalles: validDetalles.map((d) => ({
          producto_id: d.producto_id!,
          cantidad: d.cantidad,
          costo: d.costo,
        })),
      }

      if (editingCompra) {
        compraData.num_comprobante = values.num_comprobante
        await updateCompra(editingCompra.id, compraData)
        message.success('Compra actualizada')
      } else {
        await createCompra(compraData)
        message.success('Compra registrada')
      }

      setModalVisible(false)
      form.resetFields()
      setDetalles([])
      setNumComprobanteAuto('')
      loadCompras()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCompra(id)
      message.success('Compra eliminada')
      loadCompras()
    } catch {
      message.error('Error al eliminar')
    }
  }

  const addDetalleRow = () => {
    setDetalles((prev) => [...prev, { key: String(Date.now()), producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', cantidad: 1, costo: 0 }])
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
      setDetalles((prev) => prev.map((d) =>
        d.key === selectedDetalleKey
          ? { ...d, producto_id: producto.id, producto_nombre: producto.descripcion, producto_codigo: producto.codigo, producto_categoria: catMap.get(producto.categoria_id) || '' }
          : d
      ))
    }
    setProductoModalVisible(false)
    setSelectedDetalleKey(null)
  }

  const updateDetalle = (key: string, field: keyof DetalleLine, value: any) => {
    setDetalles((prev) => prev.map((d) => (d.key === key ? { ...d, [field]: value } : d)))
  }

  const updateNumComprobanteAuto = (comprobanteId: number | null) => {
    if (!comprobanteId || editingCompra || !autoNum) return
    const comp = comprobantes.find((c) => c.id === comprobanteId)
    if (comp) {
      setNumComprobanteAuto(String(comp.numero).padStart(8, '0'))
    } else {
      setNumComprobanteAuto('')
    }
  }

  const totalCalculado = useMemo(() => {
    return detalles.reduce((sum, d) => sum + (d.cantidad || 0) * (d.costo || 0), 0)
  }, [detalles])

  const handleDownloadReport = async () => {
    try {
      const inicio = filterFecha?.[0]?.format('YYYY-MM-DDTHH:mm:ss') || dayjs().startOf('month').format('YYYY-MM-DDTHH:mm:ss')
      const fin = filterFecha?.[1]?.format('YYYY-MM-DDTHH:mm:ss') || dayjs().format('YYYY-MM-DDTHH:mm:ss')
      await downloadCompraReport(inicio, fin, searchProveedorText || undefined, filterEstado)
      message.success('Reporte descargado')
    } catch {
      message.error('Error al descargar reporte')
    }
  }

  const handlePrintPdf = async (id: number) => {
    try {
      await downloadCompraPdf(id)
      message.success('PDF descargado')
    } catch {
      message.error('Error al generar PDF')
    }
  }

  const columns: ColumnsType<Compra> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Proveedor', dataIndex: 'proveedor_nombre', key: 'proveedor_nombre' },
    { title: 'Comprobante', key: 'comprobante', render: (_, r) => `${r.comprobante_nombre} ${r.num_comprobante || ''}` },
    { title: 'Estado', dataIndex: 'estado_nombre', key: 'estado_nombre', render: (val: string) => <Tag>{val}</Tag> },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    {
      title: 'Acciones', key: 'acciones', width: 160, render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
          <Button icon={<PrinterOutlined />} size="small" onClick={() => handlePrintPdf(record.id)} />
          <Popconfirm title="¿Eliminar compra?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const expandedRowRender = (record: Compra) => {
    const detColumns: ColumnsType<any> = [
      { title: 'Código', dataIndex: 'producto_codigo', key: 'producto_codigo', width: 100 },
      { title: 'Producto', key: 'producto', render: (_: any, r: any) => `${r.producto_categoria ? r.producto_categoria + ' - ' : ''}${r.producto_nombre}` },
      { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad', width: 80 },
      { title: 'Costo', dataIndex: 'costo', key: 'costo', width: 100, render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
      { title: 'Subtotal', key: 'subtotal', width: 100, render: (_: any, r: any) => `Bs. ${(r.cantidad * Number(r.costo || 0)).toFixed(2)}` },
    ]
    return (
      <Table
        columns={detColumns}
        dataSource={record.detalles?.map((d) => ({ ...d, key: d.id }))}
        pagination={false}
        rowKey="id"
        size="small"
      />
    )
  }

  const productoColumns: ColumnsType<Producto> = [
    { title: 'Código', dataIndex: 'codigo', key: 'codigo', width: 100 },
    {
      title: 'Producto',
      key: 'producto',
      render: (_, r) => `${catMap.get(r.categoria_id) || ''} - ${r.descripcion}`,
    },
    { title: 'Marca', dataIndex: 'marca', key: 'marca', width: 120 },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', width: 100, render: (val: number) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Stock', dataIndex: 'stock_actual', key: 'stock_actual', width: 80 },
  ]

  const proveedorColumns: ColumnsType<Proveedor> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'NIT', dataIndex: 'nit' },
    { title: 'Contacto', dataIndex: 'contacto' },
    { title: 'Celular', dataIndex: 'celular_contacto' },
    {
      title: 'Acciones', width: 120,
      render: (_: unknown, record: Proveedor) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingProveedor(record); proveedorForm.setFieldsValue(record); setProveedorModalVisible(true) }} />
            <Popconfirm title="¿Eliminar proveedor?" onConfirm={async () => { try { await deleteProveedor(record.id); message.success('Proveedor eliminado'); loadProveedores() } catch (e: any) { message.error(e.response?.data?.detail || 'Error al eliminar') } }}>
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Compras</h2>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadReport}>
            Reporte PDF
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Nueva Compra
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <DatePicker.RangePicker
            value={filterFecha as any}
            onChange={(dates) => setFilterFecha(dates as any)}
            placeholder={['Fecha inicio', 'Fecha fin']}
          />
          <Input.Search
            placeholder="Buscar por proveedor"
            allowClear
            style={{ width: 300 }}
            value={searchProveedorText}
            onChange={(e) => setSearchProveedorText(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag.CheckableTag
            checked={filterEstado === undefined}
            onChange={() => setFilterEstado(undefined)}
            style={{ margin: 0 }}
          >
            Todos
          </Tag.CheckableTag>
          {estados.map((est, idx) => (
            <Tag.CheckableTag
              key={est.id}
              checked={filterEstado === est.id}
              onChange={() => setFilterEstado(est.id)}
              style={{ margin: 0, backgroundColor: filterEstado === est.id ? colors[idx % colors.length] : undefined }}
            >
              {est.nombre}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCompras}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        expandable={{ expandedRowRender, rowExpandable: (r) => r.detalles && r.detalles.length > 0 }}
      />

      <Modal
        title={editingCompra ? 'Editar Compra' : 'Nueva Compra'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setDetalles([]); setNumComprobanteAuto('') }}
        onOk={handleSave}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Form.Item name="proveedor_id" label="Proveedor" rules={[{ required: true }]} style={{ width: 220, marginBottom: 12 }}>
              <Select
                showSearch
                placeholder="Seleccione un proveedor"
                filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
                options={proveedorOptions}
                disabled={editingCompra !== null}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingProveedor(null); proveedorForm.resetFields(); setProveedorModalVisible(true) }}>
                        Gestionar proveedores
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
            <Form.Item name="comprobante_id" label="Comprobante" rules={[{ required: true }]} style={{ width: 150, marginBottom: 12 }}>
              <Select
                placeholder="Seleccione un comprobante"
                options={comprobanteOptions}
                disabled={editingCompra !== null}
                onChange={(val) => updateNumComprobanteAuto(val)}
                popupRender={(menu) => (
                  <>
                    {menu}
                    <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                      <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingComprobante(null); comprobanteForm.resetFields(); setComprobanteModalVisible(true) }}>
                        Gestionar comprobantes
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
            <Form.Item name="num_comprobante" label="N° Comprobante" style={{ width: 200, marginBottom: 12 }}>
              <Input
                placeholder={autoNum ? 'Automático' : 'Ingrese número'}
                value={editingCompra ? undefined : (autoNum ? (numComprobanteAuto || undefined) : undefined)}
                disabled={editingCompra !== null || autoNum}
                addonAfter={!editingCompra ? <Switch checkedChildren="A" unCheckedChildren="M" checked={autoNum} onChange={(v) => { setAutoNum(v); if (v) setNumComprobanteAuto('') }} /> : undefined}
              />
            </Form.Item>
          </div>

          <Form.Item name="estado_id" label="Estado" rules={[{ required: true }]}>
            <Select
              placeholder="Seleccione un estado"
              options={estadoOptions}
              popupRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => { setEditingEstado(null); estadoForm.resetFields(); setEstadoModalVisible(true) }}>
                      Gestionar estados
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>

          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Detalles de compra</strong>
            {!editingCompra && numComprobanteAuto && (
              <Tag color="blue">N° Comprobante: {numComprobanteAuto}</Tag>
            )}
          </div>

          {detalles.map((det, index) => (
            <Space key={det.key} style={{ width: '100%', marginBottom: 8 }} align="start">
              <Form.Item label={index === 0 ? 'Producto' : ''} style={{ width: 320 }}>
                <Input.Search
                  placeholder="Buscar producto"
                  value={det.producto_nombre ? `[${det.producto_codigo}] ${det.producto_categoria} - ${det.producto_nombre}` : ''}
                  readOnly
                  onSearch={() => openProductoModal(det.key)}
                  enterButton={<SearchOutlined />}
                />
              </Form.Item>
              <Form.Item label={index === 0 ? 'Cantidad' : ''} style={{ width: 100 }}>
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  value={det.cantidad}
                  onChange={(val) => updateDetalle(det.key, 'cantidad', val || 0)}
                />
              </Form.Item>
              <Form.Item label={index === 0 ? 'Costo' : ''} style={{ width: 120 }}>
                <InputNumber
                  min={0}
                  step={0.01}
                  prefix="Bs."
                  style={{ width: '100%' }}
                  value={det.costo}
                  onChange={(val) => updateDetalle(det.key, 'costo', val || 0)}
                />
              </Form.Item>
              {detalles.length > 1 && (
                <Form.Item label={index === 0 ? ' ' : ''}>
                  <Button danger icon={<DeleteOutlined />} onClick={() => removeDetalleRow(det.key)} />
                </Form.Item>
              )}
            </Space>
          ))}

          <Button type="dashed" onClick={addDetalleRow} style={{ width: '100%', marginBottom: 12 }} icon={<PlusOutlined />}>
            Agregar producto
          </Button>

          <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold' }}>
            Total: Bs. {totalCalculado.toFixed(2)}
          </div>
        </Form>
      </Modal>

      <Modal
        title="Seleccionar producto"
        open={productoModalVisible}
        onCancel={() => { setProductoModalVisible(false); setSelectedDetalleKey(null) }}
        footer={null}
        width={700}
      >
        <Input.Search
          placeholder="Buscar por código, descripción o marca"
          allowClear
          style={{ marginBottom: 12 }}
          value={productoSearchText}
          onChange={(e) => setProductoSearchText(e.target.value)}
        />
        <Table
          columns={productoColumns}
          dataSource={filteredProductos}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 8 }}
          onRow={(record) => ({
            onClick: () => selectProducto(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Modal>

      <Modal
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        open={proveedorModalVisible}
        onCancel={() => setProveedorModalVisible(false)}
        onOk={async () => {
          try {
            const values = await proveedorForm.validateFields()
            if (editingProveedor) {
              await updateProveedor(editingProveedor.id, values)
              message.success('Proveedor actualizado')
            } else {
              await createProveedor(values)
              message.success('Proveedor creado')
            }
            setProveedorModalVisible(false)
            loadProveedores()
          } catch {
            message.error('Error al guardar proveedor')
          }
        }}
        width={500}
      >
        <Form form={proveedorForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nit" label="NIT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="materiales" label="Materiales" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contacto" label="Contacto" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="celular_contacto" label="Celular" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email_contacto" label="Email">
            <Input type="email" />
          </Form.Item>
        </Form>
        <Table
          columns={proveedorColumns}
          dataSource={proveedores}
          rowKey="id"
          size="small"
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
      >
        <Form form={comprobanteForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="numero" label="Número inicial" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        <Table
          columns={comprobanteSubColumns}
          dataSource={comprobantes}
          rowKey="id"
          size="small"
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
      >
        <Form form={estadoForm} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
        <Table
          columns={estadoSubColumns}
          dataSource={estados}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  )
}
