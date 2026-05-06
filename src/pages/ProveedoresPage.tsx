import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Proveedor } from '../types/proveedor'
import { getProveedores, createProveedor, deleteProveedor } from '../services/proveedorService'

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

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
      await createProveedor(values)
      message.success('Proveedor creado')
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

  const columns: ColumnsType<Proveedor> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'NIT', dataIndex: 'nit', key: 'nit' },
    { title: 'Materiales', dataIndex: 'materiales', key: 'materiales' },
    { title: 'Contacto', dataIndex: 'contacto', key: 'contacto' },
    { title: 'Celular', dataIndex: 'celular_contacto', key: 'celular_contacto' },
    { title: 'Email', dataIndex: 'email_contacto', key: 'email_contacto' },
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space>
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Nuevo Proveedor
        </Button>
      </div>
      <Table columns={columns} dataSource={proveedores} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal title="Nuevo Proveedor" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
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
