import { Table, Switch, Button, Popconfirm, Space, message } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from '../components/CrudModal'
import type { CrudField } from '../components/CrudModal'
import { useCrud } from '../hooks/useCrud'
import type { Cliente } from '../types/cliente'
import { getClientes, createCliente, updateCliente, deleteCliente, toggleClienteActivo } from '../services/clienteService'

const fields: CrudField[] = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'nit', label: 'NIT', required: true },
  { name: 'celular', label: 'Celular', required: true },
  { name: 'direccion', label: 'Dirección', type: 'textarea', required: true },
]

export default function ClientesPage() {
  const { data, loading, modalVisible, editingRecord, form, openModal, closeModal, handleSubmit, handleDelete, loadData } =
    useCrud<Cliente>({
      getAll: getClientes,
      create: createCliente as any,
      update: updateCliente as any,
      delete: deleteCliente,
    })

  const handleToggleActivo = async (id: number) => {
    try {
      await toggleClienteActivo(id)
      loadData()
    } catch {
      message.error('Error al cambiar estado')
    }
  }

  const columns: ColumnsType<Cliente> = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Nombre', dataIndex: 'nombre' },
    { title: 'NIT', dataIndex: 'nit' },
    { title: 'Celular', dataIndex: 'celular' },
    { title: 'Dirección', dataIndex: 'direccion' },
    {
      title: 'Estado',
      dataIndex: 'activo',
      render: (activo: boolean, record: Cliente) => (
        <Switch checked={activo} onChange={() => handleToggleActivo(record.id)} size="small" />
      ),
    },
    {
      title: 'Acciones',
      width: 120,
      render: (_: unknown, record: Cliente) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="¿Eliminar cliente?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Gestión de Clientes</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} />
      <CrudModal
        visible={modalVisible}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        form={form}
        title={editingRecord ? 'Editar Cliente' : 'Nuevo Cliente'}
        fields={fields}
      />
    </div>
  )
}
