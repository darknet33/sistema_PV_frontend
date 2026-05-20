import { useState, useEffect } from 'react'
import { Modal, Table, Button, Form, Input, InputNumber, Popconfirm, message, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

export interface SubEntity {
  id: number
  nombre: string
  numero?: number
}

export interface SubCrudModalProps {
  title: string
  visible: boolean
  onCancel: () => void
  onSelect: (record: SubEntity) => void
  fetchAll: () => Promise<SubEntity[]>
  create: (data: Record<string, unknown>) => Promise<SubEntity>
  update: (id: number, data: Record<string, unknown>) => Promise<SubEntity>
  remove: (id: number) => Promise<void>
  fields?: { name: string; label: string; type?: 'text' | 'number' }[]
}

export default function SubCrudModal({
  title,
  visible,
  onCancel,
  onSelect,
  fetchAll,
  create,
  update,
  remove,
  fields,
}: SubCrudModalProps) {
  const [data, setData] = useState<SubEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState<SubEntity | null>(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchAll()
      setData(result)
    } catch {
      message.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) loadData()
  }, [visible])

  const openForm = (record?: SubEntity) => {
    if (record) {
      setEditing(record)
      form.setFieldsValue(record)
    } else {
      setEditing(null)
      form.resetFields()
    }
    setFormVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editing) {
        await update(editing.id, values)
        message.success('Actualizado')
      } else {
        await create(values)
        message.success('Creado')
      }
      setFormVisible(false)
      loadData()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      message.error(axiosErr?.response?.data?.detail || 'Error al guardar')
    }
  }

  const defaultFields = fields ?? [{ name: 'nombre', label: 'Nombre' }]

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={520}
    >
      <Table
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 5 }}
        columns={[
          ...defaultFields.map((f) => ({
            title: f.label,
            dataIndex: f.name,
            key: f.name,
          })),
          {
            title: 'Acciones',
            key: 'acciones',
            width: 160,
            render: (_: unknown, record: SubEntity) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openForm(record)} />
                <Popconfirm title="¿Eliminar?" onConfirm={async () => {
                  try {
                    await remove(record.id)
                    message.success('Eliminado')
                    loadData()
                  } catch (err: unknown) {
                    const axiosErr = err as { response?: { data?: { detail?: string } } }
                    message.error(axiosErr?.response?.data?.detail || 'Error')
                  }
                }}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
                <Button size="small" type="link" onClick={() => { onSelect(record); onCancel() }}>
                  Seleccionar
                </Button>
              </Space>
            ),
          },
        ]}
      />

      {formVisible && (
        <Modal
          title={editing ? `Editar ${title.slice(0, -1)}` : `Nuevo ${title.slice(0, -1)}`}
          open={formVisible}
          onCancel={() => setFormVisible(false)}
          onOk={handleSave}
          destroyOnHidden={false}
        >
          <Form form={form} layout="vertical">
            {defaultFields.map((f) => (
              <Form.Item
                key={f.name}
                name={f.name}
                label={f.label}
                rules={[{ required: true, message: `${f.label} es requerido` }]}
              >
                {f.type === 'number' ? (
                  <InputNumber style={{ width: '100%' }} min={0} />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
          </Form>
        </Modal>
      )}

      {!formVisible && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => openForm()} style={{ width: '100%', marginTop: 8 }}>
          Nuevo
        </Button>
      )}
    </Modal>
  )
}
