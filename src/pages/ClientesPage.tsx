import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { createCliente, deleteCliente, getClientes, updateCliente, toggleClienteActivo } from '../services/clienteService'

interface ClienteCreate {
  nombre: string
  nit: string
  celular: string
  direccion: string
}

interface ClienteResponse extends ClienteCreate {
  id: number
  activo: boolean
  fecha_registro: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingCliente, setEditingCliente] = useState<ClienteResponse | null>(null)

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      setClientes(data)
    } catch (error) {
      message.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: ClienteCreate) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, values)
        message.success('Cliente actualizado')
      } else {
        await createCliente(values)
        message.success('Cliente creado')
      }
      setModalVisible(false)
      form.resetFields()
      loadClientes()
    } catch (error) {
      message.error('Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCliente(id)
      message.success('Cliente eliminado')
      loadClientes()
    } catch (error) {
      message.error('Error al eliminar')
    }
  }

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleClienteActivo(id)
      loadClientes()
    } catch (error) {
      message.error('Error al cambiar estado')
    }
  }

  const columns: ColumnsType<ClienteResponse> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
    { title: 'NIT', dataIndex: 'nit', key: 'nit' },
    { title: 'Celular', dataIndex: 'celular', key: 'celular' },
    { title: 'Dirección', dataIndex: 'direccion', key: 'direccion' },
    { title: 'Estado', dataIndex: 'activo', key: 'activo', render: (activo: boolean, record: ClienteResponse) => (
      <Switch checked={activo} onChange={() => handleToggleActivo(record.id)} size="small" />
    )},
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingCliente(record); form.setFieldsValue(record); setModalVisible(true) }} />
          <Popconfirm title="¿Eliminar cliente?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Clientes</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCliente(null); form.resetFields(); setModalVisible(true) }}>
          Nuevo Cliente
        </Button>
      </div>
      <Table columns={columns} dataSource={clientes} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
