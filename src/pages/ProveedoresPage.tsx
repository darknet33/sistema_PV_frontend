import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getProveedores, createProveedor, deleteProveedor, updateProveedor, toggleProveedorActivo } from '../services/proveedorService'

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)

  const loadProveedores = async () => {
    setLoading(true)
    try {
      const data = await getProveedores()
      setProveedores(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProveedores() }, [])

  const handleSave = async (values: Omit<Proveedor, 'id' | 'activo' | 'fecha_registro'>) => {
    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, values)
        message.success('Proveedor actualizado')
      } else {
        await createProveedor(values)
        message.success('Proveedor creado')
      }
      setModalVisible(false)
      form.resetFields()
      loadProveedores()
    } catch (error) {
      message.error('Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProveedor(id)
      message.success('Proveedor eliminado')
      loadProveedores()
    } catch (error) {
      message.error('Error al eliminar')
    }
  }

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleProveedorActivo(id)
      loadProveedores()
    } catch (error) {
      message.error('Error al cambiar estado')
    }
  }

  const columns: ColumnsType<Proveedor> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'NIT', dataIndex: 'nit', key: 'nit' },
    { title: 'Materiales', dataIndex: 'materiales', key: 'materiales' },
    { title: 'Contacto', dataIndex: 'contacto', key: 'contacto' },
    { title: 'Celular', dataIndex: 'celular_contacto', key: 'celular_contacto' },
    { title: 'Email', dataIndex: 'email_contacto', key: 'email_contacto' },
    { title: 'Estado', dataIndex: 'activo', key: 'activo', render: (activo: boolean, record: Proveedor) => (
      <Switch checked={activo} onChange={() => handleToggleActivo(record.id)} size="small" />
    )},
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingProveedor(record); form.setFieldsValue(record); setModalVisible(true) }} />
          <Popconfirm title="¿Eliminar proveedor?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Proveedores</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProveedor(null); form.resetFields(); setModalVisible(true) }}>
          Nuevo Proveedor
        </Button>
      </div>
      <Table columns={columns} dataSource={proveedores} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
          <Form.Item name="email_contacto" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
