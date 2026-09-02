import { useState, useEffect } from 'react'
import { Modal, Table, Button, Form, Input, InputNumber, Switch, Select, Popconfirm, message, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { CrudField } from './CrudModal'

export interface SubCrudModalProps {
  title: string
  visible: boolean
  onCancel: () => void
  onSelect?: (record: any) => void
  fetchAll: () => Promise<any[]>
  create: (data: any) => Promise<any>
  update: (id: number, data: any) => Promise<any>
  remove: (id: number) => Promise<void>
  fields?: CrudField[]
  columns?: ColumnsType<any>
  rowKey?: string
  onDataChange?: (data: any[]) => void
}

function renderField(field: CrudField) {
  const rules = field.required
    ? [...(field.rules ?? []), { required: true, message: `${field.label} es requerido` }]
    : field.rules

  switch (field.type) {
    case 'switch':
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} valuePropName="checked">
          <Switch {...field.props} />
        </Form.Item>
      )
    case 'select':
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
          <Select
            placeholder={field.placeholder ?? `Seleccione ${field.label.toLowerCase()}`}
            options={field.options}
            allowClear
            {...field.props}
          />
        </Form.Item>
      )
    case 'number':
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
          <InputNumber
            style={{ width: '100%' }}
            placeholder={field.placeholder ?? field.label}
            min={field.min ?? 0}
            max={field.max}
            step={field.step}
            {...field.props}
          />
        </Form.Item>
      )
    case 'password':
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
          <Input.Password placeholder={field.placeholder ?? field.label} {...field.props} />
        </Form.Item>
      )
    case 'textarea':
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
          <Input.TextArea rows={3} placeholder={field.placeholder ?? field.label} {...field.props} />
        </Form.Item>
      )
    default:
      return (
        <Form.Item key={field.name} name={field.name} label={field.label} rules={rules}>
          <Input placeholder={field.placeholder ?? field.label} {...field.props} />
        </Form.Item>
      )
  }
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
  columns,
  rowKey,
  onDataChange,
}: SubCrudModalProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()

  const defaultFields: CrudField[] = fields ?? [{ name: 'nombre', label: 'Nombre' }]

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchAll()
      setData(result)
      onDataChange?.(result)
    } catch {
      message.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) loadData()
  }, [visible])

  const openForm = (record?: any) => {
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

  const tableColumns: ColumnsType<any> = columns ?? [
    ...defaultFields
      .filter((f) => f.type !== 'password')
      .map((f) => ({ title: f.label, dataIndex: f.name, key: f.name })),
    {
      title: 'Acciones',
      key: 'acciones',
      width: onSelect ? 190 : 110,
      render: (_: unknown, record: any) => (
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
          {onSelect && (
            <Button size="small" type="link" onClick={() => { onSelect(record); onCancel() }}>
              Seleccionar
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const entityLabel = title.replace(/s$/, '').toLowerCase()

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={560}
      className="responsive-modal"
    >
      <Table
        dataSource={data}
        rowKey={rowKey ?? 'id'}
        loading={loading}
        size="small"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
        columns={tableColumns}
      />

      {formVisible && (
        <Modal
          title={editing ? `Editar ${entityLabel}` : `Nuevo ${entityLabel}`}
          open={formVisible}
          onCancel={() => setFormVisible(false)}
          onOk={handleSave}
          destroyOnHidden={false}
          className="responsive-modal"
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            {defaultFields.map((f) => renderField(f))}
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
