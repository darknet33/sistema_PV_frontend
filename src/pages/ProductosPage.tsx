import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Space, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto, ProductoCreate } from '../types/producto'
import { getProductos, createProducto, updateProducto, deleteProducto } from '../services/productoService'

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [form] = Form.useForm()

  const loadProductos = async () => {
    setLoading(true)
    try {
      const data = await getProductos()
      setProductos(data)
    } catch (error) {
      message.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProductos() }, [])

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

  const columns: ColumnsType<Producto> = [
    { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
    { title: 'Marca', dataIndex: 'marca', key: 'marca' },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', render: (val: number) => `S/. ${val.toFixed(2)}` },
    { title: 'Stock Actual', dataIndex: 'stock_actual', key: 'stock_actual' },
    { title: 'Stock Mínimo', dataIndex: 'stock_minimo', key: 'stock_minimo' },
    { title: 'Estado', dataIndex: 'activo', key: 'activo', render: (activo: boolean) => <Tag color={activo ? 'green' : 'red'}>{activo ? 'Activo' : 'Inactivo'}</Tag> },
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Productos</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProducto(null); form.resetFields(); setModalVisible(true) }}>
          Nuevo Producto
        </Button>
      </div>
      <Table columns={columns} dataSource={productos} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
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
          <Form.Item name="categoria_id" label="Categoría ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
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
    </div>
  )
}
