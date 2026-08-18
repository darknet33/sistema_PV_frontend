import { useState, useEffect } from 'react'
import { Table, Modal, Button, Transfer, Spin, Tag, Popconfirm, Space, message } from 'antd'
import { PlusOutlined, SecurityScanOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from '../../components/CrudModal'
import type { CrudField } from '../../components/CrudModal'
import PageHeader from '../../components/PageHeader'
import { useCrud } from '../../hooks/useCrud'
import rolService from '../../services/rolService'
import moduloService from '../../services/moduloService'
import type { Rol, Modulo } from '../../types/configuracion'

const fields: CrudField[] = [
  { name: 'nombre', label: 'Nombre', required: true },
]

export default function RolesPage() {
  const { data, loading, modalVisible, editingRecord, form, openModal, closeModal, handleSubmit, handleDelete } =
    useCrud<Rol>(rolService)

  const [modulos, setModulos] = useState<Modulo[]>([])
  const [modalesOpen, setModalesOpen] = useState(false)
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [modulosLoading, setModulosLoading] = useState(false)

  useEffect(() => {
    moduloService.getAll().then(setModulos).catch(() => message.error('Error al cargar módulos'))
  }, [])

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

  const transferDataSource = modulos.map((m) => ({
    key: String(m.id),
    title: m.nombre,
    description: m.activo ? 'Activo' : 'Inactivo',
    disabled: !m.activo,
  }))

  const columns: ColumnsType<Rol> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      width: 240,
      render: (_: unknown, record: Rol) => (
        <Space>
          <Button size="small" icon={<SecurityScanOutlined />} onClick={() => handleOpenModales(record)}>
            Módulos
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="¿Eliminar rol?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Roles">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Nuevo Rol
        </Button>
      </PageHeader>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} />

      <CrudModal
        visible={modalVisible}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        form={form}
        title={editingRecord ? 'Editar Rol' : 'Nuevo Rol'}
        fields={fields}
      />

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
