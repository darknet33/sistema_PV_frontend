import { Table, Switch, Button, Popconfirm, Space, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from '../components/CrudModal'
import type { CrudField } from '../components/CrudModal'
import { useCrud } from '../hooks/useCrud'
import type { Proveedor } from '../types/proveedor'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor, toggleProveedorActivo } from '../services/proveedorService'

const fields: CrudField[] = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'nit', label: 'NIT', required: true },
  { name: 'materiales', label: 'Materiales', required: true },
  { name: 'contacto', label: 'Contacto', required: true },
  { name: 'celular_contacto', label: 'Celular', required: true },
  { name: 'email_contacto', label: 'Email', required: true },
]

export default function ProveedoresPage() {
  const { data, loading, modalVisible, editingRecord, form, openModal, closeModal, handleSubmit, handleDelete, loadData } =
    useCrud<Proveedor>({
      getAll: getProveedores,
      create: createProveedor as any,
      update: updateProveedor as any,
      delete: deleteProveedor,
    })

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleProveedorActivo(id)
      loadData()
    } catch {
      message.error('Error al cambiar estado')
    }
  }

  const columns: ColumnsType<Proveedor> = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'NIT', dataIndex: 'nit' },
    { title: 'Materiales', dataIndex: 'materiales' },
    { title: 'Contacto', dataIndex: 'contacto' },
    { title: 'Celular', dataIndex: 'celular_contacto' },
    { title: 'Email', dataIndex: 'email_contacto' },
    {
      title: 'Estado',
      dataIndex: 'activo',
      render: (activo: boolean, record: Proveedor) => (
        <Switch checked={activo} onChange={() => handleToggleActivo(record.id)} size="small" />
      ),
    },
    {
      title: 'Acciones',
      width: 120,
      render: (_: unknown, record: Proveedor) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="¿Eliminar proveedor?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Gestión de Proveedores</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      <CrudModal
        visible={modalVisible}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        form={form}
        title={editingRecord ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        fields={fields}
      />
    </div>
  )
}
