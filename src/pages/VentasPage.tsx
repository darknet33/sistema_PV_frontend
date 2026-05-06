import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Venta } from '../types/venta'
import { getVentas, createVenta, deleteVenta } from '../services/ventaService'
import dayjs from 'dayjs'

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const loadVentas = async () => {
    setLoading(true)
    try {
      const data = await getVentas()
      setVentas(data)
    } catch (error) {
      message.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVentas() }, [])

  const handleSave = async (values: any) => {
    try {
      const ventaData = {
        ...values,
        fecha: values.fecha.format('YYYY-MM-DD HH:mm:ss'),
        detalles: [{ producto_id: 1, cantidad: 1, precio: 0, utilidad: 0 }]
      }
      await createVenta(ventaData)
      message.success('Venta registrada')
      setModalVisible(false)
      form.resetFields()
      loadVentas()
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteVenta(id)
      message.success('Venta eliminada')
      loadVentas()
    } catch (error) {
      message.error('Error al eliminar')
    }
  }

  const columns: ColumnsType<Venta> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha' },
    { title: 'Cliente ID', dataIndex: 'cliente_id', key: 'cliente_id' },
    { title: 'Comprobante', dataIndex: 'num_comprobante', key: 'num_comprobante' },
    { title: 'Estado ID', dataIndex: 'estado_id', key: 'estado_id' },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (val: number) => `S/. ${val?.toFixed(2) || '0.00'}` },
    { title: 'Impuesto', dataIndex: 'impuesto', key: 'impuesto', render: (val: number) => `${val || 0}%` },
    { title: 'Descuento', dataIndex: 'descuento', key: 'descuento', render: (val: number) => `${val || 0}%` },
    {
      title: 'Acciones', key: 'acciones', render: (_, record) => (
        <Space>
          <Popconfirm title="¿Eliminar venta?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Gestión de Ventas</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Nueva Venta
        </Button>
      </div>
      <Table columns={columns} dataSource={ventas} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal title="Nueva Venta" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]} getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cliente_id" label="Cliente ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comprobante_id" label="Comprobante ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="estado_id" label="Estado ID" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="impuesto" label="Impuesto %" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="descuento" label="Descuento %" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
