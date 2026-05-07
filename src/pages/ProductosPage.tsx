import { useEffect, useState, useMemo } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Space, Tag, Select, Spin, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto, ProductoCreate } from '../types/producto'
import { getProductos, createProducto, updateProducto, deleteProducto, toggleProductoActivo } from '../services/productoService'
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

  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const matchesCategoria = filterCategoria ? p.categoria_id === filterCategoria : true
      const matchesSearch = p.descripcion?.toLowerCase().includes(searchText.toLowerCase())
      return matchesCategoria && matchesSearch
    })
  }, [productos, filterCategoria, searchText])

  const loadProductos = async () => {
    setLoading(true)
    try {
      const data = await getProductos()
      setProductos(Array.isArray(data) ? data : [])
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
      { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (val) => `Bs. ${Number(val || 0).toFixed(2)}` },
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Productos</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProducto(null); form.resetFields(); setModalVisible(true) }}>
          Nuevo Producto
        </Button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Buscar por descripción"
          allowClear
          style={{ maxWidth: 300, marginBottom: 12 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag.CheckableTag
            checked={filterCategoria === undefined}
            onChange={() => setFilterCategoria(undefined)}
            style={{ margin: 0 }}
          >
            Todas
          </Tag.CheckableTag>
          {categorias.map((cat, idx) => (
            <Tag.CheckableTag
              key={cat.id}
              checked={filterCategoria === cat.id}
              onChange={() => setFilterCategoria(cat.id)}
              style={{ margin: 0, backgroundColor: filterCategoria === cat.id ? colors[idx % colors.length] : undefined }}
            >
              {cat.nombre}
            </Tag.CheckableTag>
          ))}
        </div>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={filteredProductos} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>
      <Modal title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
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
