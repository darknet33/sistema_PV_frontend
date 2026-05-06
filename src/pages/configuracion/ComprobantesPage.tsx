import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import comprobanteService, { Comprobante, ComprobanteCreate } from '../../services/comprobanteService'

const { Title } = Typography

export default function ComprobantesPage() {
  const [data, setData] = useState<Comprobante[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingComprobante, setEditingComprobante] = useState<Comprobante | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const comprobantes = await comprobanteService.getAll()
      setData(comprobantes)
    } catch {
      message.error('Error al cargar comprobantes')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (record?: Comprobante) => {
    if (record) {
      setEditingComprobante(record)
      form.setFieldsValue(record)
    } else {
      setEditingComprobante(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingComprobante) {
        await comprobanteService.update(editingComprobante.id, values as ComprobanteCreate)
        message.success('Comprobante actualizado')
      } else {
        await comprobanteService.create(values as ComprobanteCreate)
        message.success('Comprobante creado')
      }
      setModalOpen(false)
      loadData()
    } catch {
      message.error('Error al guardar comprobante')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await comprobanteService.delete(id)
      message.success('Comprobante eliminado')
      loadData()
    } catch {
      message.error('Error al eliminar comprobante')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'Número', dataIndex: 'numero' },
    {
      title: 'Acciones',
      render: (_: unknown, record: Comprobante) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar comprobante?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Comprobantes</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nuevo Comprobante
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingComprobante ? 'Editar Comprobante' : 'Nuevo Comprobante'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="numero" label="Número" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
