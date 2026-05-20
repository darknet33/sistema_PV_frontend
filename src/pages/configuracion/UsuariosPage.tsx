import { useEffect, useState } from 'react'
import { Table, Button, Popconfirm, Space, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from '../../components/CrudModal'
import type { CrudField } from '../../components/CrudModal'
import { useCrud } from '../../hooks/useCrud'
import usuarioService from '../../services/usuarioService'
import rolService from '../../services/rolService'
import type { Usuario, Rol } from '../../types/configuracion'

export default function UsuariosPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const { data, loading, modalVisible, editingRecord, form, openModal, closeModal, handleSubmit, handleDelete } =
    useCrud<Usuario>(usuarioService)

  useEffect(() => {
    rolService.getAll().then(setRoles).catch(() => message.error('Error al cargar roles'))
  }, [])

  const fields: CrudField[] = [
    { name: 'username', label: 'Username', required: true },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: !editingRecord,
      rules: editingRecord ? [] : [{ required: true, message: 'Password requerido' }],
    },
    { name: 'nombres', label: 'Nombres', required: true },
    { name: 'apellidos', label: 'Apellidos', required: true },
    { name: 'cargo', label: 'Cargo', required: true },
    {
      name: 'rol_id',
      label: 'Rol',
      type: 'select',
      required: true,
      options: roles.map((r) => ({ value: r.id, label: r.nombre })),
    },
  ]

  const columns: ColumnsType<Usuario> = [
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
      width: 120,
      render: (_: unknown, record: Usuario) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="¿Eliminar usuario?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Usuarios</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      <CrudModal
        visible={modalVisible}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        form={form}
        title={editingRecord ? 'Editar Usuario' : 'Nuevo Usuario'}
        fields={fields}
        width={520}
      />
    </div>
  )
}
