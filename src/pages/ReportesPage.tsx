import { useState } from 'react'
import { Card, DatePicker, Button, Space, Row, Col, message } from 'antd'
import { FilePdfOutlined, BarChartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../services/api'

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, 'month'))
  const [fechaFin, setFechaFin] = useState<dayjs.Dayjs | null>(dayjs())
  const [loading, setLoading] = useState(false)

  const generarReporte = async (tipo: string) => {
    if (!fechaInicio || !fechaFin) {
      message.warning('Seleccione las fechas')
      return
    }
    
    setLoading(true)
    try {
      const params = {
        fecha_inicio: fechaInicio.format('YYYY-MM-DD 00:00:00'),
        fecha_fin: fechaFin.format('YYYY-MM-DD 23:59:59')
      }
      
      const response = await api.get(`/reportes/${tipo}/pdf`, {
        params,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${tipo}_${dayjs().format('YYYYMMDD')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('Reporte generado')
    } catch (error) {
      message.error('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Reportes</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card title="Kardex de Producto" bordered>
            <p>Seleccione el rango de fechas para generar el Kardex en PDF.</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <DatePicker 
                value={fechaInicio} 
                onChange={setFechaInicio}
                style={{ width: '100%' }}
                placeholder="Fecha inicio"
              />
              <DatePicker 
                value={fechaFin} 
                onChange={setFechaFin}
                style={{ width: '100%' }}
                placeholder="Fecha fin"
              />
              <Button 
                type="primary" 
                icon={<FilePdfOutlined />}
                loading={loading}
                onClick={() => generarReporte('kardex/1')}
                block
              >
                Generar Kardex PDF
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card title="Reporte de Ventas" bordered>
            <p>Genere el reporte de ventas en formato PDF.</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <DatePicker 
                value={fechaInicio} 
                onChange={setFechaInicio}
                style={{ width: '100%' }}
                placeholder="Fecha inicio"
              />
              <DatePicker 
                value={fechaFin} 
                onChange={setFechaFin}
                style={{ width: '100%' }}
                placeholder="Fecha fin"
              />
              <Button 
                type="primary" 
                icon={<BarChartOutlined />}
                loading={loading}
                onClick={() => generarReporte('ventas')}
                block
              >
                Reporte Ventas PDF
              </Button>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card title="Reporte de Compras" bordered>
            <p>Genere el reporte de compras en formato PDF.</p>
            <Space direction="vertical" style={{ width: '100%' }}>
              <DatePicker 
                value={fechaInicio} 
                onChange={setFechaInicio}
                style={{ width: '100%' }}
                placeholder="Fecha inicio"
              />
              <DatePicker 
                value={fechaFin} 
                onChange={setFechaFin}
                style={{ width: '100%' }}
                placeholder="Fecha fin"
              />
              <Button 
                type="primary" 
                icon={<FilePdfOutlined />}
                loading={loading}
                onClick={() => generarReporte('compras')}
                block
              >
                Reporte Compras PDF
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
