import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message, Typography, Spin, Transfer, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SecurityScanOutlined } from '@ant-design/icons'
import rolService, { Rol, RolCreate } from '../../services/rolService'
import moduloService, { Modulo } from '../../services/moduloService'

const { Title } = Typography

export default function RolesPage() {
  const [data, setData] = useState<Rol[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRol, setEditingRol] = useState<Rol | null>(null)
  const [form] = Form.useForm()

  const [modalesOpen, setModalesOpen] = useState(false)
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [modulosLoading, setModulosLoading] = useState(false)

  useEffect(() => {
    loadData()
    loadModulos()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const roles = await rolService.getAll()
      setData(roles)
    } catch {
      message.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }

  const loadModulos = async () => {
    try {
      const modulosData = await moduloService.getAll()
      setModulos(modulosData)
    } catch {
      message.error('Error al cargar módulos')
    }
  }

  const handleOpenModal = (record?: Rol) => {
    if (record) {
      setEditingRol(record)
      form.setFieldsValue(record)
    } else {
      setEditingRol(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRol) {
        await rolService.update(editingRol.id, values as RolCreate)
        message.success('Rol actualizado')
      } else {
        await rolService.create(values as RolCreate)
        message.success('Rol creado')
      }
      setModalOpen(false)
      loadData()
    } catch {
      message.error('Error al guardar rol')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await rolService.delete(id)
      message.success('Rol eliminado')
      loadData()
    } catch {
      message.error('Error al eliminar rol')
    }
  }

  const handleOpenModales = async (rol: Rol) => {
    setSelectedRol(rol)
    setModalesOpen(true)
    setModulosLoading(true)
    try {
      const asignaciones = await rolService.getModulosByRol(rol.id)
      setTargetKeys(asignaciones.map((a) => String(a.modulo_id)))
    } catch {
      message.error('Error al cargar módulos del rol')
    } finally {
      setModulosLoading(false)
    }
  }

  const handleSaveModulos = async () => {
    if (!selectedRol) return
    try {
      await rolService.asignarModulos(selectedRol.id, targetKeys.map((k) => Number(k)))
      message.success('Módulos asignados correctamente')
      setModalesOpen(false)
    } catch {
      message.error('Error al asignar módulos')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      render: (_: unknown, record: Rol) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<SecurityScanOutlined />} onClick={() => handleOpenModales(record)}>
            Módulos
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar rol?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  const transferDataSource = modulos.map((m) => ({
    key: String(m.id),
    title: m.nombre,
    description: m.activo ? 'Activo' : 'Inactivo',
    disabled: !m.activo,
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Roles</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nuevo Rol
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingRol ? 'Editar Rol' : 'Nuevo Rol'}
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

      <Modal
        title={`Asignar Módulos - ${selectedRol?.nombre || ''}`}
        open={modalesOpen}
        onOk={handleSaveModulos}
        onCancel={() => setModalesOpen(false)}
        width={600}
      >
        <Spin spinning={modulosLoading}>
          <Transfer
            titles={['Módulos disponibles', 'Asignados']}
            dataSource={transferDataSource}
            targetKeys={targetKeys}
            onChange={(keys) => setTargetKeys(keys as string[])}
            render={(item) => (
              <span>
                {item.title} {item.disabled && <Tag color="red">Inactivo</Tag>}
              </span>
            )}
            listStyle={{ width: 250, height: 300 }}
          />
        </Spin>
      </Modal>
    </div>
  )
}
