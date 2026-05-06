import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Switch, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import moduloService, { Modulo, ModuloCreate } from '../../services/moduloService'

const { Title } = Typography

export default function ModulosPage() {
  const [data, setData] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingModulo, setEditingModulo] = useState<Modulo | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const modulos = await moduloService.getAll()
      setData(modulos)
    } catch {
      message.error('Error al cargar módulos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (record?: Modulo) => {
    if (record) {
      setEditingModulo(record)
      form.setFieldsValue(record)
    } else {
      setEditingModulo(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingModulo) {
        await moduloService.update(editingModulo.id, values as ModuloCreate)
        message.success('Módulo actualizado')
      } else {
        await moduloService.create(values as ModuloCreate)
        message.success('Módulo creado')
      }
      setModalOpen(false)
      loadData()
    } catch {
      message.error('Error al guardar módulo')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await moduloService.delete(id)
      message.success('Módulo eliminado')
      loadData()
    } catch {
      message.error('Error al eliminar módulo')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Activo',
      dataIndex: 'activo',
      render: (activo: boolean) => (activo ? 'Sí' : 'No'),
    },
    {
      title: 'Acciones',
      render: (_: unknown, record: Modulo) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar módulo?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Módulos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nuevo Módulo
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
