import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Popconfirm, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import categoriaService, { Categoria, CategoriaCreate } from '../../services/categoriaService'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    setLoading(true)
    try {
      const data = await categoriaService.getAll()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      message.error('Error al cargar categorías')
      setCategorias([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (record?: Categoria) => {
    if (record) {
      setEditingCategoria(record)
      form.setFieldsValue(record)
    } else {
      setEditingCategoria(null)
      form.resetFields()
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategoria) {
        await categoriaService.update(editingCategoria.id, values as CategoriaCreate)
        message.success('Categoría actualizada')
      } else {
        await categoriaService.create(values as CategoriaCreate)
        message.success('Categoría creada')
      }
      setModalOpen(false)
      form.resetFields()
      loadCategorias()
    } catch {
      message.error('Error al guardar categoría')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await categoriaService.delete(id)
      message.success('Categoría eliminada')
      loadCategorias()
    } catch {
      message.error('Error al eliminar categoría')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Nombre', dataIndex: 'nombre' },
    {
      title: 'Acciones',
      width: 140,
      render: (_: unknown, record: Categoria) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar categoría?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Gestión de Categorías</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Nueva Categoría
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={categorias} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
