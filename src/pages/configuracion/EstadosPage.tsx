import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import estadoService, { Estado, EstadoCreate } from '../../services/estadoService'

const { Title } = Typography

export default function EstadosPage() {
  const [data, setData] = useState<Estado[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEstado, setEditingEstado] = useState<Estado | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const estados = await estadoService.getAll()
      setData(estados)
    } catch {
      message.error('Error al cargar estados')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (record?: Estado) => {
    if (record) {
      setEditingEstado(record)
      form.setFieldsValue(record)
    } else {
      setEditingEstado(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingEstado) {
        await estadoService.update(editingEstado.id, values as EstadoCreate)
        message.success('Estado actualizado')
      } else {
        await estadoService.create(values as EstadoCreate)
        message.success('Estado creado')
      }
      setModalOpen(false)
      loadData()
    } catch {
      message.error('Error al guardar estado')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await estadoService.delete(id)
      message.success('Estado eliminado')
      loadData()
    } catch {
      message.error('Error al eliminar estado')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      render: (_: unknown, record: Estado) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar estado?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Estados</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nuevo Estado
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingEstado ? 'Editar Estado' : 'Nuevo Estado'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
