import { useEffect, useState, useMemo, useRef } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Space, Tag, Select, Spin, Switch, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto, ProductoCreate } from '../types/producto'
import { getProductos, createProducto, updateProducto, deleteProducto, toggleProductoActivo, exportProductos, importProductos, deleteProductosBatch, deleteAllProductos } from '../services/productoService'
import categoriaService, { Categoria } from '../services/categoriaService'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [form] = Form.useForm()

  const [catModalVisible, setCatModalVisible] = useState(false)
  const [catForm] = Form.useForm()
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)

  const [filterCategoria, setFilterCategoria] = useState<number | undefined>(undefined)
  const [searchText, setSearchText] = useState('')
  const [importing, setImporting] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const matchesCategoria = filterCategoria ? p.categoria_id === filterCategoria : true
      const matchesSearch = p.descripcion?.toLowerCase().includes(searchText.toLowerCase())
      return matchesCategoria && matchesSearch
    })
  }, [productos, filterCategoria, searchText])

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize })
  }

  const handleFilterChange = (newFilter: number | undefined) => {
    setFilterCategoria(newFilter)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchText(newSearch)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const loadProductos = async () => {
    setLoading(true)
    try {
      const data = await getProductos()
      setProductos(Array.isArray(data) ? data : [])
      setPagination(prev => ({ ...prev, current: 1 }))
    } catch (error) {
      message.error('Error al cargar productos')
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const data = await categoriaService.getAll()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      message.error('Error al cargar categorías')
      setCategorias([])
    }
  }

  useEffect(() => {
    loadProductos()
    loadCategorias()
  }, [])

  const handleSave = async (values: ProductoCreate) => {
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, values)
        message.success('Producto actualizado')
      } else {
        await createProducto({ ...values, stock_actual: values.stock_inicial, usuario_id: 1 })
        message.success('Producto creado')
      }
      setModalVisible(false)
      form.resetFields()
      loadProductos()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto(id)
      message.success('Producto eliminado')
      loadProductos()
    } catch (error) {
      message.error('Error al eliminar')
    }
  }

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleProductoActivo(id)
      loadProductos()
    } catch (error) {
      message.error('Error al cambiar estado')
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportProductos()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'productos.xlsx'
      link.click()
      URL.revokeObjectURL(url)
      message.success('Archivo exportado correctamente')
    } catch {
      message.error('Error al exportar productos')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const result = await importProductos(file)
      loadProductos()
      loadCategorias()
      if (result.errores.length > 0) {
        message.warning(`Importacion: ${result.procesados} procesados, ${result.creados} creados, ${result.actualizados} actualizados, ${result.errores.length} errores`)
        console.error('Errores de importacion:', result.errores)
      } else {
        message.success(`Importacion exitosa: ${result.procesados} procesados, ${result.creados} creados, ${result.actualizados} actualizados`)
      }
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al importar productos')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) return
    try {
      const result = await deleteProductosBatch(selectedRowKeys as number[])
      setSelectedRowKeys([])
      message.success(result.message)
      loadProductos()
    } catch (error) {
      message.error('Error al eliminar productos seleccionados')
    }
  }

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllProductos()
      message.success(result.message)
      loadProductos()
    } catch (error) {
      message.error('Error al eliminar todos los productos')
    }
  }

  const handleOpenCatModal = (record?: Categoria) => {
    if (record) {
      setEditingCategoria(record)
      catForm.setFieldsValue(record)
    } else {
      setEditingCategoria(null)
      catForm.resetFields()
    }
    setCatModalVisible(true)
  }

  const handleSaveCategoria = async () => {
    try {
      const values = await catForm.validateFields()
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, values)
        message.success('Categoría actualizada')
      } else {
        await categoriaService.create(values)
        message.success('Categoría creada')
      }
      setCatModalVisible(false)
      loadCategorias()
    } catch {
      message.error('Error al guardar categoría')
    }
  }

  const handleDeleteCategoria = async (id: number) => {
    try {
      await categoriaService.delete(id)
      message.success('Categoría eliminada')
      loadCategorias()
    } catch {
      message.error('Error al eliminar categoría')
    }
  }

  const catColumns: ColumnsType<Categoria> = useMemo(() => [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      width: 140,
      render: (_: unknown, record: Categoria) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenCatModal(record)} />
          <Popconfirm title="¿Eliminar categoría?" onConfirm={() => handleDeleteCategoria(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [categorias])

  const columns: ColumnsType<Producto> = useMemo(() => {
    const catMap = new Map<number, string>()
    categorias.forEach((c) => catMap.set(c.id, c.nombre))

    return [
      { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
      { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
      { title: 'Marca', dataIndex: 'marca', key: 'marca' },
      { title: 'Categoría', dataIndex: 'categoria_id', key: 'categoria_id', render: (id: number) => catMap.get(id) || `#${id}` },
      { title: 'Peso', dataIndex: 'peso', key: 'peso', render: (val) => `${Number(val || 0).toFixed(2)} kg` },
      { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (val) => `Bs. ${Number(val || 0).toFixed(2)}` },
      { title: 'Registrado por', dataIndex: 'usuario_nombre', key: 'usuario_nombre' },
      { title: 'Stock Actual', dataIndex: 'stock_actual', key: 'stock_actual', render: (val: number, record: Producto) => {
        const bajo = val < (record.stock_minimo || 0)
        return <Tag color={bajo ? 'red' : 'default'}>{val ?? 0}{bajo ? ' ⚠️' : ''}</Tag>
      }},
      { title: 'Stock Mínimo', dataIndex: 'stock_minimo', key: 'stock_minimo', render: (val: number) => val ?? 0 },
      { title: 'Estado', dataIndex: 'activo', key: 'activo', render: (activo: boolean, record: Producto) => (
        <Switch checked={activo} onChange={() => handleToggleActivo(record.id)} size="small" />
      )},
      {
        title: 'Acciones', key: 'acciones', render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingProducto(record); form.setFieldsValue(record); setModalVisible(true) }} />
            <Popconfirm title="¿Eliminar producto?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Space>
        )
      }
    ]
  }, [categorias])

  const catSelectOptions = useMemo(() =>
    categorias.map((c) => ({ value: c.id, label: c.nombre })),
    [categorias]
  )

  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb']

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  const hasSelected = selectedRowKeys.length > 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Gestión de Productos</h2>
        <Space wrap>
          <Popconfirm
            title="¿Eliminar todos los productos?"
            onConfirm={handleDeleteAll}
            okText="Sí, eliminar todos"
            cancelText="Cancelar"
          >
            <Button danger>Eliminar todos</Button>
          </Popconfirm>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Exportar
          </Button>
          <Button icon={<ImportOutlined />} loading={importing} onClick={() => fileInputRef.current?.click()}>
            Importar
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProducto(null); form.resetFields(); setModalVisible(true) }}>
            Nuevo Producto
          </Button>
        </Space>
      </div>
      <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Buscar por descripción"
          allowClear
          style={{ maxWidth: 300, marginBottom: 12 }}
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag.CheckableTag
            checked={filterCategoria === undefined}
            onChange={() => handleFilterChange(undefined)}
            style={{ margin: 0 }}
          >
            Todas
          </Tag.CheckableTag>
          {categorias.map((cat, idx) => (
            <Tag.CheckableTag
              key={cat.id}
              checked={filterCategoria === cat.id}
              onChange={() => handleFilterChange(cat.id)}
              style={{ margin: 0, backgroundColor: filterCategoria === cat.id ? colors[idx % colors.length] : undefined }}
            >
              {cat.nombre}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>
      {hasSelected && (
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>{selectedRowKeys.length} seleccionado(s)</span>
          <Popconfirm
            title={`¿Eliminar ${selectedRowKeys.length} producto(s)?`}
            onConfirm={handleDeleteSelected}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button danger size="small">Eliminar seleccionados</Button>
          </Popconfirm>
        </div>
      )}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredProductos}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `${total} productos`,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationChange,
          }}
        />
      </Spin>
      <Modal title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        {editingProducto && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <div><strong>Creado:</strong> {editingProducto.fecha_registro ? new Date(editingProducto.fecha_registro).toLocaleString('es-BO') : '-'}</div>
              <div><strong>Última modificación:</strong> {editingProducto.fecha_actualizado ? new Date(editingProducto.fecha_actualizado).toLocaleString('es-BO') : '-'}</div>
            </div>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoria_id" label="Categoría" rules={[{ required: true, message: 'Seleccione una categoría' }]}>
            <Select
              placeholder="Seleccione una categoría"
              options={catSelectOptions}
              popupRender={(menu) => (
                <>
                  {menu}
                  <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => handleOpenCatModal()}>
                      Gestionar categorías
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
          <Form.Item name="precio" label="Precio" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="peso" label="Peso (kg)">
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_inicial" label="Stock Inicial" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_minimo" label="Stock Mínimo" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        open={catModalVisible}
        onCancel={() => setCatModalVisible(false)}
        onOk={handleSaveCategoria}
      >
        <Form form={catForm} layout="vertical" style={{ marginBottom: 16 }}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>
        </Form>
        <Table
          columns={catColumns}
          dataSource={categorias}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  )
}
