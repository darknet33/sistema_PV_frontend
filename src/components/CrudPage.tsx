import type { ReactNode } from 'react'
import { Button, Popconfirm, Spin, Grid } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from './CrudModal'
import type { CrudField } from './CrudModal'
import { useCrud } from '../hooks/useCrud'
import ResponsiveTable from './ResponsiveTable'
import PageHeader from './PageHeader'

const { useBreakpoint } = Grid

interface CrudActions<T> {
  getAll: () => Promise<T[]>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
  delete: (id: number) => Promise<void>
}

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
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const actionColumn: ColumnsType<T> = [
    ...columns,
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_: unknown, record: T) => (
        <div className="flex gap-1">
          <Button size={isMobile ? 'middle' : 'small'} icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="¿Eliminar?" onConfirm={() => handleDelete(record.id)}>
            <Button size={isMobile ? 'middle' : 'small'} danger icon={<DeleteOutlined />} />
          </Popconfirm>
          {extraActions?.(record)}
        </div>
      ),
    },
  ]

  if (loading && data.length === 0) {
    return <Spin className="flex justify-center py-20" />
  }

  return (
    <div>
      <PageHeader title={title}>
        {extraHeader}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Nuevo
        </Button>
      </PageHeader>

      <ResponsiveTable
        columns={actionColumn}
        dataSource={data}
        rowKey={rowKey}
        loading={loading}
        pagination={{ pageSize: 10, size: isMobile ? 'small' : 'default' }}
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
