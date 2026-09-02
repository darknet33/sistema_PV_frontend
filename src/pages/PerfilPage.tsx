import { useState } from 'react'
import { Card, Form, Input, Button, Descriptions, Tag, message, Grid } from 'antd'
import { UserOutlined, SaveOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import usuarioService from '../services/usuarioService'
import PageHeader from '../components/PageHeader'

const { useBreakpoint } = Grid

export default function PerfilPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await usuarioService.update(usuario!.id, {
        username: usuario!.username,
        nombres: values.nombres,
        apellidos: values.apellidos,
        cargo: values.cargo,
        rol_id: usuario!.rol_id,
        password: '',
      })
      message.success('Perfil actualizado')
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!usuario) return null

  return (
    <div>
      <PageHeader title="Mi Perfil" />

      <div className={`flex ${isMobile ? 'flex-col' : 'gap-6'}`}>
        <Card className={`${isMobile ? 'mb-4' : 'w-[280px]'} flex-shrink-0`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
              <UserOutlined style={{ fontSize: 36, color: '#fff' }} />
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{usuario.nombres} {usuario.apellidos}</div>
              <div className="text-gray-500">@{usuario.username}</div>
            </div>
            <Tag color={usuario.activo ? 'green' : 'red'}>
              {usuario.activo ? 'Activo' : 'Inactivo'}
            </Tag>
          </div>
        </Card>

        <Card title="Información Personal" className="flex-1">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
            <Descriptions.Item label="Usuario">{usuario.username}</Descriptions.Item>
            <Descriptions.Item label="Cargo">{usuario.cargo || '-'}</Descriptions.Item>
            <Descriptions.Item label="Fecha de registro">
              {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-BO') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Última actualización">
              {usuario.fecha_actualizado ? new Date(usuario.fecha_actualizado).toLocaleDateString('es-BO') : '-'}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              nombres: usuario.nombres,
              apellidos: usuario.apellidos,
              cargo: usuario.cargo,
            }}
            onFinish={handleSave}
            className="mt-6"
          >
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4`}>
              <Form.Item name="nombres" label="Nombres" rules={[{ required: true, message: 'Ingrese sus nombres' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="apellidos" label="Apellidos" rules={[{ required: true, message: 'Ingrese sus apellidos' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="cargo" label="Cargo">
                <Input />
              </Form.Item>
            </div>
            <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={saving}>
              Guardar cambios
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  )
}
