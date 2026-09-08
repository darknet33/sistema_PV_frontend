import { useState, useEffect } from 'react'
import { App, Modal, Button, Transfer, Spin, Tag, Popconfirm, Space, Grid } from 'antd'
import { PlusOutlined, SecurityScanOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import CrudModal from '../../components/CrudModal'
import type { CrudField } from '../../components/CrudModal'
import PageHeader from '../../components/PageHeader'
import ResponsiveTable from '../../components/ResponsiveTable'
import { useCrud } from '../../hooks/useCrud'
import rolService from '../../services/rolService'
import moduloService from '../../services/moduloService'
import type { Rol, Modulo } from '../../types/configuracion'

const fields: CrudField[] = [
  { name: 'nombre', label: 'Nombre', required: true },
]

export default function RolesPage() {
  const { message } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
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
      key: 'acciones',
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

  const fabVisible = isMobile && !modalVisible

  return (
    <div className={fabVisible ? 'pb-16' : ''}>
      <PageHeader title="Roles">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className={isMobile ? 'hidden' : ''}>
          Nuevo Rol
        </Button>
      </PageHeader>
      <ResponsiveTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {fabVisible && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          className="!fixed bottom-6 right-6 z-50 !w-14 !h-14 !text-2xl shadow-lg"
        />
      )}

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
