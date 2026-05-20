import type { ReactNode } from 'react'
import { Button, Table, Popconfirm, Spin, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from './CrudModal'
import type { CrudField } from './CrudModal'
import { useCrud } from '../hooks/useCrud'

const { Title } = Typography

interface CrudActions<T> {
  getAll: () => Promise<T[]>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
  delete: (id: number) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CrudPageProps<T extends { id: number }> {
  title: string
  actions: CrudActions<T>
  columns: ColumnsType<T>
  fields: CrudField[]
  modalTitle?: string
  rowKey?: string
  extraActions?: (record: T) => ReactNode
  extraHeader?: ReactNode
}

export default function CrudPage<T extends { id: number }>({
  title,
  actions,
  columns,
  fields,
  modalTitle,
  rowKey = 'id',
  extraActions,
  extraHeader,
}: CrudPageProps<T>) {
  const { data, loading, modalVisible, editingRecord, form, openModal, closeModal, handleSubmit, handleDelete } =
    useCrud<T>(actions)

  const actionColumn: ColumnsType<T> = [
    ...columns,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_: unknown, record: T) => (
        <span>
          <Button
            type="link"
            onClick={() => openModal(record)}
          >
            Editar
          </Button>
          <Popconfirm title="¿Eliminar?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Eliminar</Button>
          </Popconfirm>
          {extraActions?.(record)}
        </span>
      ),
    },
  ]

  if (loading && data.length === 0) {
    return <Spin style={{ display: 'block', marginTop: 80 }} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          {extraHeader}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Nuevo
          </Button>
        </div>
      </div>

      <Table
        columns={actionColumn}
        dataSource={data}
        rowKey={rowKey}
        loading={loading}
        size="middle"
        pagination={{ pageSize: 10 }}
      />

      <CrudModal
        visible={modalVisible}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        form={form}
        title={modalTitle ?? (editingRecord ? `Editar ${title.slice(0, -1)}` : `Nuevo ${title.slice(0, -1)}`)}
        fields={fields}
        editing={!!editingRecord}
      />
    </div>
  )
}
