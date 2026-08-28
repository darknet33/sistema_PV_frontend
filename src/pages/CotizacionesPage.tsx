import { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Popconfirm, message, Tag, Input, Switch, Grid, Checkbox, Card, Space, Select } from 'antd'
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined,
  CheckOutlined, ShoppingCartOutlined, ProfileOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Cotizacion, CotizacionCreate } from '../types/cotizacion'
import {
  getCotizaciones, createCotizacion, updateCotizacion, deleteCotizacion, confirmarCotizacion,
  convertirCotizacionEnVenta, fetchCotizacionPdfBlob,
} from '../services/cotizacionService'
import usePdfPreview from '../hooks/usePdfPreview'
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clienteService'
import comprobanteService from '../services/comprobanteService'
import estadoService from '../services/estadoService'
import { getProductos } from '../services/productoService'
import categoriaService from '../services/categoriaService'

import type { Cliente } from '../types/cliente'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import type { UnidadMedida } from '../types/unidadMedida'
import ResponsiveTable from '../components/ResponsiveTable'
import PageHeader from '../components/PageHeader'
import ProductoSelectorModal from '../components/ProductoSelectorModal'
import SubCrudSelect from '../components/SubCrudSelect'

const { useBreakpoint } = Grid

const IVA_RATE = 13
const IT_RATE = 3

const FORMA_PAGO_OPTIONS = ['Transferencia SIGEP', 'Cheque', 'Al contado']

interface DetalleLine {
  key: string
  producto_id: number | null
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  unidad_id: number | null
  unidad_nombre: string
  unidad_abreviatura: string
  es_principal: boolean
  factor_conversion: number
  cantidad: number
  costo: number
  utilidad_pct: number
  precio_venta: number
  stock_actual: number
  unidades_disponibles: UnidadMedida[]
}

const estadoColor: Record<string, string> = {
  Enviado: 'blue',
  Confirmado: 'green',
  Vencido: 'red',
}

function calcularPrecioVenta(costo: number, pct: number): number {
  const c = Number(costo || 0)
  const p = Number(pct || 0)
  return Math.round((c + (c * p / 100)) * 100) / 100
}

export default function CotizacionesPage() {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const { openPdf, previewModal } = usePdfPreview()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCotizacion, setEditingCotizacion] = useState<Cotizacion | null>(null)
  const [form] = Form.useForm()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [comprobantes, setComprobantes] = useState<{ id: number; nombre: string; numero: number }[]>([])
  const [estados, setEstados] = useState<{ id: number; nombre: string }[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])


  const [detalles, setDetalles] = useState<DetalleLine[]>([])

  const [filterFecha, setFilterFecha] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [searchClienteText, setSearchClienteText] = useState('')
  const [filterEstado, setFilterEstado] = useState<string | undefined>(undefined)

  const [productoModalVisible, setProductoModalVisible] = useState(false)
  const [selectedDetalleKey, setSelectedDetalleKey] = useState<string | null>(null)

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailCotizacion, setDetailCotizacion] = useState<Cotizacion | null>(null)

  const [convertVisible, setConvertVisible] = useState(false)
  const [convertCotizacion, setConvertCotizacion] = useState<Cotizacion | null>(null)
  const [convertForm] = Form.useForm()
  const [autoNum, setAutoNum] = useState(true)

  const clienteOptions = useMemo(
    () => clientes.filter((c) => c.activo !== false).map((c) => ({ value: c.id, label: c.nombre })),
    [clientes]
  )

  const catMap = useMemo(() => {
    const map = new Map<number, string>()
    categorias.forEach((c) => map.set(c.id, c.nombre))
    return map
  }, [categorias])

  const loadCotizaciones = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCotizaciones()
      setCotizaciones(data)
    } catch {
      message.error('Error al cargar cotizaciones')
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
      loadCotizaciones(),
      loadClientes(),
      loadComprobantes(),
      loadEstados(),
      loadProductos(),
      loadCategorias(),
    ])
  }, [loadCotizaciones, loadClientes, loadComprobantes, loadEstados, loadProductos, loadCategorias])

  useEffect(() => { loadAllData() }, [loadAllData])

  const refresh = useCallback(() => {
    loadCotizaciones()
    loadProductos()
  }, [loadCotizaciones, loadProductos])

  useRealtimeRefresh('cotizaciones', refresh)
  useRealtimeRefresh('ventas', refresh)

  const filteredCotizaciones = useMemo(() => {
    return cotizaciones.filter((c) => {
      if (filterFecha && filterFecha[0] && filterFecha[1]) {
        const fecha = dayjs(c.fecha)
        const inicio = filterFecha[0].startOf('day')
        const fin = filterFecha[1].endOf('day')
        if (fecha.isBefore(inicio) || fecha.isAfter(fin)) return false
      }
      if (searchClienteText) {
        const q = searchClienteText.toLowerCase()
        if (!c.cliente_razon_social?.toLowerCase().includes(q)) return false
      }
      if (filterEstado && c.estado !== filterEstado) return false
      return true
    })
  }, [cotizaciones, filterFecha, searchClienteText, filterEstado])

  const openCreateModal = async () => {
    await loadProductos()
    setEditingCotizacion(null)
    setDetalles([{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', unidad_id: null, unidad_nombre: '', unidad_abreviatura: '', es_principal: true, factor_conversion: 1, cantidad: 1, costo: 0, utilidad_pct: 0, precio_venta: 0, stock_actual: 0, unidades_disponibles: [] }])
    form.resetFields()
    form.setFieldsValue({
      fecha: dayjs(),
      con_factura: false,
      incluir_imagenes: false,
      validez_dias: 15,
      descuento: 0,
    })
    setModalVisible(true)
  }

  const openEditModal = async (cot: Cotizacion) => {
    await loadProductos()
    setEditingCotizacion(cot)
    form.setFieldsValue({
      fecha: dayjs(cot.fecha),
      cliente_id: cot.cliente_id,
      con_factura: cot.con_factura,
      incluir_imagenes: cot.incluir_imagenes,
      modalidad_pago: cot.modalidad_pago || '',
      forma_pago: cot.forma_pago || '',
      validez_dias: cot.validez_dias,
      terminos_condiciones: cot.terminos_condiciones || '',
      descuento: Number(cot.descuento || 0),
    })
    setDetalles(
      cot.detalles?.map((d, i) => {
        const prod = productos.find((p) => p.id === d.producto_id)
        const unidadesProducto: UnidadMedida[] = (prod?.unidades || []).map((pu) => ({
          id: pu.unidad_id,
          nombre: pu.unidad_nombre,
          abreviatura: pu.unidad_abreviatura,
          categoria_unidad_id: null,
          activo: true,
          categoria_nombre: '',
        }))
        return {
          key: String(i + 1),
          producto_id: d.producto_id,
          producto_nombre: d.producto_nombre,
          producto_codigo: d.producto_codigo,
          producto_categoria: d.producto_categoria || '',
          unidad_id: d.unidad_id || null,
          unidad_nombre: d.unidad_nombre || '',
          unidad_abreviatura: d.unidad_abreviatura || '',
          es_principal: d.es_principal ?? true,
          factor_conversion: d.factor_conversion ?? 1,
          cantidad: d.cantidad,
          costo: Number(d.costo || 0),
          utilidad_pct: Number(d.utilidad_pct || 0),
          precio_venta: Number(d.precio_venta || 0),
          stock_actual: Number(d.stock_actual || 0),
          unidades_disponibles: unidadesProducto,
        }
      }) || [{ key: '1', producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', unidad_id: null, unidad_nombre: '', unidad_abreviatura: '', es_principal: true, factor_conversion: 1, cantidad: 1, costo: 0, utilidad_pct: 0, precio_venta: 0, stock_actual: 0, unidades_disponibles: [] }]
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

      const data: CotizacionCreate = {
        fecha: values.fecha.format('YYYY-MM-DD'),
        cliente_id: values.cliente_id,
        con_factura: values.con_factura || false,
        incluir_imagenes: values.incluir_imagenes || false,
        modalidad_pago: values.modalidad_pago || '',
        forma_pago: values.forma_pago || '',
        validez_dias: values.validez_dias || 15,
        terminos_condiciones: values.terminos_condiciones || '',
        descuento: values.descuento || 0,
        detalles: validDetalles.map((d) => ({
          producto_id: d.producto_id!,
          unidad_id: d.unidad_id,
          cantidad: d.cantidad,
          costo: d.costo,
          utilidad_pct: d.utilidad_pct,
        })),
      }

      if (editingCotizacion) {
        await updateCotizacion(editingCotizacion.id, data)
        message.success('Cotización actualizada')
      } else {
        await createCotizacion(data)
        message.success('Cotización creada')
      }

      setModalVisible(false)
      form.resetFields()
      setDetalles([])
      loadCotizaciones()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleConfirmar = async (id: number) => {
    try {
      await confirmarCotizacion(id)
      message.success('Cotización confirmada')
      loadCotizaciones()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al confirmar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCotizacion(id)
      message.success('Cotización eliminada')
      loadCotizaciones()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al eliminar')
    }
  }

  const addDetalleRow = () => {
    setDetalles((prev) => [...prev, { key: String(Date.now()), producto_id: null, producto_nombre: '', producto_codigo: '', producto_categoria: '', unidad_id: null, unidad_nombre: '', unidad_abreviatura: '', es_principal: true, factor_conversion: 1, cantidad: 1, costo: 0, utilidad_pct: 0, precio_venta: 0, stock_actual: 0, unidades_disponibles: [] }])
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
      const utilidad_pct = costo > 0 ? (Number(producto.utilidad || 0) / costo) * 100 : 0
      const unidadesProducto: UnidadMedida[] = (producto.unidades || []).map((pu) => ({
        id: pu.unidad_id,
        nombre: pu.unidad_nombre,
        abreviatura: pu.unidad_abreviatura,
        categoria_unidad_id: null,
        activo: true,
        categoria_nombre: '',
      }))
      const principal = producto.unidad_principal
      const unidadId = principal ? principal.unidad_id : (unidadesProducto.length > 0 ? unidadesProducto[0].id : null)
      const u = principal || (unidadesProducto.length > 0 ? unidadesProducto[0] : null)
      setDetalles((prev) => prev.map((d) =>
        d.key === selectedDetalleKey
          ? {
              ...d,
              producto_id: producto.id,
              producto_nombre: producto.descripcion,
              producto_codigo: producto.codigo,
              producto_categoria: catMap.get(producto.categoria_id) || '',
              costo,
              utilidad_pct,
              precio_venta: calcularPrecioVenta(costo, utilidad_pct),
              stock_actual: Number((producto as any).stock_actual || 0),
              unidad_id: unidadId,
               unidad_nombre: ('nombre' in (u as any) ? (u as UnidadMedida)?.nombre : (u as any)?.unidad_nombre) || '',
               unidad_abreviatura: ('abreviatura' in (u as any) ? (u as UnidadMedida)?.abreviatura : (u as any)?.unidad_abreviatura) || '',
              es_principal: principal ? true : false,
              factor_conversion: principal?.factor_conversion || 1,
              unidades_disponibles: unidadesProducto,
            }
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
      if (field === 'costo' || field === 'utilidad_pct') {
        updated.precio_venta = calcularPrecioVenta(updated.costo, updated.utilidad_pct)
      }
      return updated
    }))
  }

  const watchedFecha = Form.useWatch('fecha', form)
  const watchedValidez = Form.useWatch('validez_dias', form)
  const watchedConFactura = Form.useWatch('con_factura', form)
  const watchedDescuento = Form.useWatch('descuento', form)
  const conFactura = !!watchedConFactura
  const descuentoPct = Number(watchedDescuento || 0)

  const fechaVencimiento = useMemo(() => {
    if (!watchedFecha) return null
    return dayjs(watchedFecha).add(Number(watchedValidez || 0), 'day')
  }, [watchedFecha, watchedValidez])

  const subtotalCalculado = useMemo(() => {
    return detalles.reduce((sum, d) => sum + (d.cantidad || 0) * (d.precio_venta || 0), 0)
  }, [detalles])

  const ivaCalculado = useMemo(() => {
    return conFactura ? Math.round(subtotalCalculado * IVA_RATE) / 100 : 0
  }, [subtotalCalculado, conFactura])

  const itCalculado = useMemo(() => {
    return conFactura ? Math.round(subtotalCalculado * IT_RATE) / 100 : 0
  }, [subtotalCalculado, conFactura])

  const descuentoCalculado = useMemo(() => {
    return Math.round(subtotalCalculado * descuentoPct) / 100
  }, [subtotalCalculado, descuentoPct])

  const totalCalculado = useMemo(() => {
    return Math.round((subtotalCalculado + ivaCalculado + itCalculado - descuentoCalculado) * 100) / 100
  }, [subtotalCalculado, ivaCalculado, itCalculado, descuentoCalculado])

  const handlePdfPreview = async (id: number) => {
    await openPdf(() => fetchCotizacionPdfBlob(id), `Cotización #${id}`, `cotizacion_${id}.pdf`)
  }

  const openConvertModal = (cot: Cotizacion) => {
    setConvertCotizacion(cot)
    setAutoNum(true)
    const pendiente = estados.find((e) => e.nombre.toUpperCase() === 'PENDIENTE')
    convertForm.resetFields()
    convertForm.setFieldsValue({
      estado_id: pendiente?.id,
      num_comprobante: '',
    })
    setConvertVisible(true)
  }

  const handleConvertir = async () => {
    try {
      const values = await convertForm.validateFields()
      if (!convertCotizacion) return
      await convertirCotizacionEnVenta(convertCotizacion.id, {
        comprobante_id: values.comprobante_id,
        estado_id: values.estado_id,
        num_comprobante: autoNum ? undefined : (values.num_comprobante || ''),
        automatico: autoNum,
      })
      message.success('Venta creada a partir de la cotización')
      setConvertVisible(false)
      convertForm.resetFields()
      loadCotizaciones()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al convertir')
    }
  }

  const estadoOptions = useMemo(
    () => estados.map((e) => ({ value: e.id, label: e.nombre })),
    [estados]
  )

  const detColumns: ColumnsType<any> = [
    { title: 'Código', dataIndex: 'producto_codigo', key: 'producto_codigo', width: 90 },
    { title: 'Producto', key: 'producto', render: (_: any, r: any) => `${r.producto_categoria ? r.producto_categoria + ' - ' : ''}${r.producto_nombre}` },
    { title: 'Unidad', key: 'unidad', width: 100, render: (_: any, r: any) => r.unidad_nombre ? `${r.unidad_nombre} (${r.unidad_abreviatura || '-'})` : '-' },
    { title: 'Cant.', dataIndex: 'cantidad', key: 'cantidad', width: 60, render: (_: any, r: any) => (
      <div>
        <div>{r.cantidad}</div>
        {r.cantidad > r.stock_actual && (
          <div className="text-xs text-red-500 font-medium">Stock: {r.stock_actual}</div>
        )}
      </div>
    )},
    { title: 'Util. %', dataIndex: 'utilidad_pct', key: 'utilidad_pct', width: 70, render: (val: any) => `${Number(val || 0).toFixed(2)}%` },
    { title: 'P. Venta', dataIndex: 'precio_venta', key: 'precio_venta', width: 90, render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Subtotal', key: 'subtotal', width: 100, render: (_: any, r: any) => `Bs. ${(r.cantidad * Number(r.precio_venta || 0)).toFixed(2)}` },
  ]

  const columns: ColumnsType<Cotizacion> = [
    { title: 'N°', dataIndex: 'numero', key: 'numero', width: 110 },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Cliente', dataIndex: 'cliente_razon_social', key: 'cliente_razon_social' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (val: string) => <Tag color={estadoColor[val]}>{val}</Tag> },
    { title: 'Subtotal', dataIndex: 'subtotal', key: 'subtotal', render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'IVA', dataIndex: 'iva', key: 'iva', render: (val: any) => (Number(val || 0) > 0 ? `Bs. ${Number(val).toFixed(2)}` : '-') },
    { title: 'IT', dataIndex: 'it', key: 'it', render: (val: any) => (Number(val || 0) > 0 ? `Bs. ${Number(val).toFixed(2)}` : '-') },
    { title: 'Desc.', dataIndex: 'descuento', key: 'descuento', render: (val: any) => (Number(val || 0) > 0 ? `${Number(val)}%` : '-') },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val: any) => `Bs. ${Number(val || 0).toFixed(2)}` },
    { title: 'Vence', dataIndex: 'fecha_vencimiento', key: 'fecha_vencimiento', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    {
      title: 'Venta', key: 'venta', width: 80,
      render: (_, r) => (r.venta_id ? <Tag color="green">N° {r.venta_id}</Tag> : '-'),
    },
    {
      title: 'Acciones', key: 'acciones', width: 320,
      render: (_, record) => {
        const editable = record.estado === 'Enviado' && !record.venta_id
        const eliminable = record.estado !== 'Confirmado' && !record.venta_id
        return (
          <div className="flex gap-1 flex-wrap">
            <Button size={isMobile ? 'middle' : 'small'} icon={<ProfileOutlined />} title="Ver detalle" onClick={() => { setDetailCotizacion(record); setDetailVisible(true) }} />
            <Button size={isMobile ? 'middle' : 'small'} icon={<EyeOutlined />} title="Vista previa" onClick={() => handlePdfPreview(record.id)} />
            {editable && (
              <>
                <Button size={isMobile ? 'middle' : 'small'} icon={<EditOutlined />} title="Editar" onClick={() => openEditModal(record)} />
                <Popconfirm title="¿Confirmar cotización?" onConfirm={() => handleConfirmar(record.id)}>
                  <Button size={isMobile ? 'middle' : 'small'} icon={<CheckOutlined />} title="Confirmar" className="!text-green-600" />
                </Popconfirm>
              </>
            )}
            {record.estado === 'Confirmado' && !record.venta_id && (
              <Popconfirm title="¿Convertir en venta?" onConfirm={() => openConvertModal(record)}>
                <Button size={isMobile ? 'middle' : 'small'} icon={<ShoppingCartOutlined />} title="Convertir en venta" className="!text-blue-600" />
              </Popconfirm>
            )}
            {eliminable && (
              <Popconfirm title="¿Eliminar cotización?" onConfirm={() => handleDelete(record.id)}>
                <Button size={isMobile ? 'middle' : 'small'} danger icon={<DeleteOutlined />} title="Eliminar" />
              </Popconfirm>
            )}
          </div>
        )
      },
    },
  ]

  const fabVisible = isMobile && !modalVisible && !detailVisible && !convertVisible

  const comprobanteCrudModalProps = {
    title: 'Comprobantes',
    onSelect: (rec: any) => convertForm.setFieldValue('comprobante_id', rec.id),
    fetchAll: comprobanteService.getAll as any,
    create: comprobanteService.create as any,
    update: comprobanteService.update as any,
    remove: comprobanteService.delete as any,
    fields: [
      { name: 'nombre', label: 'Nombre' },
      { name: 'numero', label: 'Número', type: 'number' as const },
    ],
    onDataChange: (list: any[]) => setComprobantes(list),
  }

  const estadoCrudModalProps = {
    title: 'Estados',
    onSelect: (rec: any) => convertForm.setFieldValue('estado_id', rec.id),
    fetchAll: estadoService.getAll as any,
    create: estadoService.create as any,
    update: estadoService.update as any,
    remove: estadoService.delete as any,
    fields: [{ name: 'nombre', label: 'Nombre' }],
    onDataChange: (list: any[]) => setEstados(list),
  }

  return (
    <div className={fabVisible ? 'pb-16' : ''}>
      <PageHeader title="Gestión de Cotizaciones">
        <Button type="primary" icon={<PlusOutlined />} size={isMobile ? 'middle' : 'middle'} onClick={openCreateModal} className={isMobile ? 'hidden' : ''}>
          Nueva Cotización
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
          {(['Enviado', 'Confirmado', 'Vencido'] as const).map((est) => (
            <Tag.CheckableTag
              key={est}
              checked={filterEstado === est}
              onChange={() => setFilterEstado(est)}
              className="!m-0"
              style={{ color: estadoColor[est] }}
            >
              {est}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>

      <ResponsiveTable
        columns={columns}
        dataSource={filteredCotizaciones}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10, size: isMobile ? 'small' : 'default' }}
        expandable={!isMobile ? { expandedRowRender: (record) => (
          <Table
            columns={detColumns}
            dataSource={record.detalles?.map((d) => ({ ...d, key: d.id }))}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ x: 'max-content' }}
          />
        ), rowExpandable: (r) => r.detalles && r.detalles.length > 0 } : undefined}
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
        title={editingCotizacion ? `Editar Cotización ${editingCotizacion.numero}` : 'Nueva Cotización'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setDetalles([]) }}
        onOk={handleSave}
        width={860}
        className="responsive-modal"
      >
        <Form form={form} layout="vertical">
          <div className="flex flex-wrap gap-3">
            <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} className="flex-1 min-w-[150px] !mb-3" getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="cliente_id" label="Cliente" rules={[{ required: true }]} className="flex-1 min-w-[200px] !mb-3">
              <SubCrudSelect
                placeholder="Seleccione un cliente"
                options={clienteOptions}
                disabled={editingCotizacion !== null}
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
            <Form.Item name="validez_dias" label="Validez (días)" rules={[{ required: true }]} className="flex-1 min-w-[120px] !mb-3" initialValue={15}>
              <InputNumber min={1} max={365} className="w-full" />
            </Form.Item>
          </div>

          <div className="flex flex-wrap gap-6 mb-2">
            <Form.Item name="con_factura" label="Con factura" valuePropName="checked" className="!mb-0">
              <Checkbox />
            </Form.Item>
            <Form.Item name="incluir_imagenes" label="Incluir imágenes de productos" valuePropName="checked" className="!mb-0">
              <Checkbox />
            </Form.Item>
            {fechaVencimiento && (
              <div className="self-center text-sm text-gray-500">
                Vencimiento: <strong>{fechaVencimiento.format('DD/MM/YYYY')}</strong>
              </div>
            )}
          </div>

          <Form.Item name="modalidad_pago" label="Modalidad de pago">
            <Input placeholder="Ej. 50% adelanto, 50% contra entrega" />
          </Form.Item>
          <div className="flex flex-wrap gap-3">
            <Form.Item name="forma_pago" label="Forma de pago" className="flex-1 min-w-[200px]">
              <Select
                allowClear
                placeholder="Seleccione la forma de pago"
                options={FORMA_PAGO_OPTIONS.map((f) => ({ value: f, label: f }))}
              />
            </Form.Item>
            <Form.Item name="descuento" label="Descuento %" className="flex-1 min-w-[140px]">
              <InputNumber min={0} max={100} step={0.01} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="terminos_condiciones" label="Términos y condiciones">
            <Input.TextArea rows={3} placeholder="Términos y condiciones de la oferta" />
          </Form.Item>

          <div className="flex justify-between items-center mb-2">
            <strong>Detalles de la cotización</strong>
            {conFactura && <Tag color="orange">IVA {IVA_RATE}% + IT {IT_RATE}%</Tag>}
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
              <div className="w-[120px] shrink-0">
                <Form.Item label={index === 0 ? 'Unidad' : ''} className="!mb-0">
                  <Select
                    placeholder="Unidad"
                    value={det.unidad_id}
                    onChange={(val) => {
                      const u = det.unidades_disponibles.find((uu) => uu.id === val)
                      updateDetalle(det.key, 'unidad_id', val)
                      updateDetalle(det.key, 'unidad_nombre', u?.nombre || '')
                      updateDetalle(det.key, 'unidad_abreviatura', u?.abreviatura || '')
                    }}
                    options={det.unidades_disponibles.map((u) => ({ value: u.id, label: `${u.nombre} (${u.abreviatura || '-'})` }))}
                    size="small"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </div>
              <div className="w-[65px] shrink-0">
                <Form.Item label={index === 0 ? 'Cant.' : ''} className="!mb-0">
                  <InputNumber
                    min={0.01}
                    step={0.01}
                    className="w-full"
                    value={det.cantidad}
                    onChange={(val) => updateDetalle(det.key, 'cantidad', val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="w-[95px] shrink-0">
                <Form.Item label={index === 0 ? 'Costo' : ''} className="!mb-0">
                  <InputNumber
                    min={0}
                    step={0.01}
                    prefix="Bs."
                    className="w-full"
                    value={det.costo}
                    onChange={(val) => updateDetalle(det.key, 'costo', val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="w-[95px] shrink-0">
                <Form.Item label={index === 0 ? 'Util. %' : ''} className="!mb-0">
                  <InputNumber
                    min={0}
                    step={0.01}
                    suffix="%"
                    className="w-full"
                    value={det.utilidad_pct}
                    onChange={(val) => updateDetalle(det.key, 'utilidad_pct', val || 0)}
                  />
                </Form.Item>
              </div>
              <div className="w-[95px] shrink-0">
                <Form.Item label={index === 0 ? 'P. Venta' : ''} className="!mb-0">
                  <InputNumber
                    className="w-full"
                    value={det.precio_venta}
                    disabled
                    variant="borderless"
                    prefix="Bs."
                  />
                </Form.Item>
              </div>
              <div className="w-[95px] shrink-0">
                <Form.Item label={index === 0 ? 'Subtotal' : ''} className="!mb-0">
                  <InputNumber
                    className="w-full"
                    value={(det.cantidad || 0) * (det.precio_venta || 0)}
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
            {conFactura && (
              <>
                <div className="font-normal text-sm text-orange-500">
                  IVA ({IVA_RATE}%): Bs. {ivaCalculado.toFixed(2)}
                </div>
                <div className="font-normal text-sm text-orange-500">
                  IT ({IT_RATE}%): Bs. {itCalculado.toFixed(2)}
                </div>
              </>
            )}
            {descuentoPct > 0 && (
              <div className="font-normal text-sm text-green-600">
                Descuento ({descuentoPct}%): -Bs. {descuentoCalculado.toFixed(2)}
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
      />

      <Modal
        title="Detalle de Cotización"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={820}
        className="responsive-modal"
      >
        {detailCotizacion && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
              <div>
                <div className="text-lg font-bold">Cotización N° {detailCotizacion.numero}</div>
                <div className="text-sm text-gray-500">
                  {dayjs(detailCotizacion.fecha).format('DD/MM/YYYY')} · Vence el {dayjs(detailCotizacion.fecha_vencimiento).format('DD/MM/YYYY')}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Tag color={estadoColor[detailCotizacion.estado]} className="!m-0 !text-xs !px-2 !py-0.5">
                  {detailCotizacion.estado}
                </Tag>
                {detailCotizacion.venta_id && (
                  <Tag color="green" className="!m-0 !text-xs !px-2 !py-0.5">
                    Venta N° {detailCotizacion.venta_id}
                  </Tag>
                )}
              </div>
            </div>

            <Card size="small" title="Cliente" className="!mb-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Cliente</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.cliente_razon_social}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">NIT</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.cliente_nit || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Celular</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.cliente_celular || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Dirección</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.cliente_direccion || '-'}</div>
                </div>
              </div>
            </Card>

            <Card size="small" title="Condiciones de la oferta" className="!mb-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Con factura</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.con_factura ? 'Sí' : 'No'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Incluir imágenes</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.incluir_imagenes ? 'Sí' : 'No'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Modalidad de pago</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.modalidad_pago || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs uppercase tracking-wide">Forma de pago</div>
                  <div className="font-medium mt-0.5">{detailCotizacion.forma_pago || '-'}</div>
                </div>
              </div>
            </Card>

            <div className="mb-2 font-medium">Productos</div>
            <Table
              columns={detColumns}
              dataSource={detailCotizacion.detalles?.map((d) => ({ ...d, key: d.id }))}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 'max-content' }}
            />

            <Card size="small" className="mt-3">
              <div className="text-right font-bold">
                <div className="font-normal text-sm text-gray-500">
                  Subtotal: Bs. {Number(detailCotizacion.subtotal || 0).toFixed(2)}
                </div>
                {Number(detailCotizacion.iva || 0) > 0 && (
                  <div className="font-normal text-sm text-orange-500">
                    IVA (13%): Bs. {Number(detailCotizacion.iva).toFixed(2)}
                  </div>
                )}
                {Number(detailCotizacion.it || 0) > 0 && (
                  <div className="font-normal text-sm text-orange-500">
                    IT (3%): Bs. {Number(detailCotizacion.it).toFixed(2)}
                  </div>
                )}
                {Number(detailCotizacion.descuento || 0) > 0 && (
                  <div className="font-normal text-sm text-green-600">
                    Descuento ({detailCotizacion.descuento}%): -Bs. {(Number(detailCotizacion.subtotal || 0) * Number(detailCotizacion.descuento) / 100).toFixed(2)}
                  </div>
                )}
                <div className="text-lg mt-1">Total: Bs. {Number(detailCotizacion.total || 0).toFixed(2)}</div>
              </div>
            </Card>

            {detailCotizacion.terminos_condiciones && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm whitespace-pre-line">
                <strong>Términos y condiciones</strong>
                <div className="mt-1">{detailCotizacion.terminos_condiciones}</div>
              </div>
            )}

            <div className="mt-3 text-right">
              <Space>
                <Button icon={<EyeOutlined />} onClick={() => handlePdfPreview(detailCotizacion.id)}>Vista previa</Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={convertCotizacion ? `Convertir ${convertCotizacion.numero} en Venta` : 'Convertir en Venta'}
        open={convertVisible}
        onCancel={() => setConvertVisible(false)}
        onOk={handleConvertir}
        width={520}
        className="responsive-modal"
      >
        <p className="text-sm text-gray-500 mb-3">
          Se creará una venta con los productos, cantidades y precios de esta cotización, descontando stock.
        </p>
        <Form form={convertForm} layout="vertical">
          <Form.Item name="comprobante_id" label="Comprobante" rules={[{ required: true }]}>
            <SubCrudSelect
              placeholder="Seleccione un comprobante"
              options={comprobantes.map((c) => ({ value: c.id, label: c.nombre }))}
              modalProps={comprobanteCrudModalProps}
            />
          </Form.Item>
          <Form.Item name="estado_id" label="Estado de la venta">
            <SubCrudSelect
              placeholder="Seleccione un estado (Pendiente por defecto)"
              options={estadoOptions}
              modalProps={estadoCrudModalProps}
            />
          </Form.Item>
          <Form.Item name="num_comprobante" label="N° Comprobante">
            <Space.Compact className="w-full">
              <Input
                placeholder={autoNum ? 'Automático' : 'Ingrese número'}
                disabled={autoNum}
                className="w-full"
              />
              <Switch checkedChildren="A" unCheckedChildren="M" checked={autoNum} onChange={setAutoNum} />
            </Space.Compact>
          </Form.Item>
        </Form>
        {convertCotizacion?.con_factura && (
          <div className="text-sm text-orange-500">
            La venta incluirá IVA (13%) + IT (3%) porque la cotización es con factura.
          </div>
        )}
        {convertCotizacion && Number(convertCotizacion.descuento || 0) > 0 && (
          <div className="text-sm text-green-600">
            El descuento de {convertCotizacion.descuento}% se trasladará a la venta.
          </div>
        )}
      </Modal>
      {previewModal}
    </div>
  )
}
