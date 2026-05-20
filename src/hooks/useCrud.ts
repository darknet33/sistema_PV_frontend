import { useState, useEffect, useCallback } from 'react'
import { message, Form } from 'antd'

interface CrudActions<T> {
  getAll: () => Promise<T[]>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
  delete: (id: number) => Promise<void>
}

export function useCrud<T extends { id: number }>({
  getAll,
  create,
  update,
  delete: remove,
}: CrudActions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<T | null>(null)
  const [form] = Form.useForm()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAll()
      setData(result)
    } catch {
      message.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [getAll])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openModal = (record?: T) => {
    if (record) {
      setEditingRecord(record)
      form.setFieldsValue(record as any)
    } else {
      setEditingRecord(null)
      form.resetFields()
    }
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await update(editingRecord.id, values)
        message.success('Actualizado correctamente')
      } else {
        await create(values)
        message.success('Creado correctamente')
      }
      closeModal()
      loadData()
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      message.error(axiosErr?.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await remove(id)
      message.success('Eliminado correctamente')
      loadData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      message.error(axiosErr?.response?.data?.detail || 'Error al eliminar')
    }
  }

  return {
    data,
    loading,
    modalVisible,
    editingRecord,
    form,
    loadData,
    openModal,
    closeModal,
    handleSubmit,
    handleDelete,
  }
}
