import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Space, Popconfirm, message, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Compra } from '../types/compra'
import { getCompras, createCompra, deleteCompra } from '../services/compraService'
import dayjs from 'dayjs'

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadCompras = async () => {
    setLoading(true)
    try {
      const data = await getCompras()
      setCompras(data)
    } catch (error) {
      message.error('Error al cargar compras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCompras() }, [])

  const handleSave = async (values: any) => {
    try {
      const compraData = {
        ...values,
        fecha: values.fecha.format('YYYY-MM-DD HH:mm:ss'),
        detalles: [{ producto_id: 1, cantidad: 1, costo: 0 }]
      }
      await createCompra(compraData)
      message.success('Compra registrada')
      setModalVisible(false)
      form.resetFields()
      loadCompras()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCompra(id)
      message.success('Compra eliminada')
      loadCompras()
    } catch (error) {
      message.error('Error al eliminar')
    }
  }

  const columns: ColumnsType<Compra> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
    { title: 'Proveedor ID', dataIndex: 'proveedor_id', key: 'proveedor_id' },
    { title: 'Comprobante', dataIndex: 'num_comprobante', key: 'num_comprobante' },
    { title: 'Estado ID', dataIndex: 'estado_id', key: 'estado_id' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val: number) => `S/. ${val?.toFixed(2) || '0.00'}` },
    { title: 'Activo', dataIndex: 'activo', key: 'activo', render: (activo: boolean) => <Tag color={activo ? 'green' : 'red'}>{activo ? 'Sí' : 'No'}</Tag> },
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space>
          <Popconfirm title="¿Eliminar compra?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Compras</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Nueva Compra
        </Button>
      </div>
      <Table columns={columns} dataSource={compras} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal title="Nueva Compra" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="proveedor_id" label="Proveedor ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comprobante_id" label="Comprobante ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="estado_id" label="Estado ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
