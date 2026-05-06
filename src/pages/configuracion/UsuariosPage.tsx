import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Typography, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import usuarioService, { Usuario, UsuarioCreate } from '../../services/usuarioService'
import rolService, { Rol } from '../../services/rolService'

const { Title } = Typography

export default function UsuariosPage() {
  const [data, setData] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadRoles()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const usuarios = await usuarioService.getAll()
      setData(usuarios)
    } catch {
      message.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const rolesData = await rolService.getAll()
      setRoles(rolesData)
    } catch {
      message.error('Error al cargar roles')
    }
  }

  const handleOpenModal = (record?: Usuario) => {
    if (record) {
      setEditingUser(record)
      form.setFieldsValue({ ...record, password: undefined })
    } else {
      setEditingUser(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        await usuarioService.update(editingUser.id, values as UsuarioCreate)
        message.success('Usuario actualizado')
      } else {
        await usuarioService.create(values as UsuarioCreate)
        message.success('Usuario creado')
      }
      setModalOpen(false)
      loadData()
    } catch {
      message.error('Error al guardar usuario')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await usuarioService.delete(id)
      message.success('Usuario eliminado')
      loadData()
    } catch {
      message.error('Error al eliminar usuario')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Nombres', dataIndex: 'nombres' },
    { title: 'Apellidos', dataIndex: 'apellidos' },
    { title: 'Cargo', dataIndex: 'cargo' },
    {
      title: 'Rol',
      dataIndex: 'rol_id',
      render: (rolId: number) => roles.find((r) => r.id === rolId)?.nombre || 'N/A',
    },
    {
      title: 'Activo',
      dataIndex: 'activo',
      render: (activo: boolean) => (activo ? 'Sí' : 'No'),
    },
    {
      title: 'Acciones',
      render: (_: unknown, record: Usuario) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar usuario?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Usuarios</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nuevo Usuario
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: !editingUser, message: 'Password requerido' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="nombres" label="Nombres" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apellidos" label="Apellidos" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cargo" label="Cargo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
            <Select>
              {roles.map((rol) => (
                <Select.Option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
