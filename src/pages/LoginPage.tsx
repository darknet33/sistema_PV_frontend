import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Spin, message, notification } from 'antd'
import { LockOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { checkUsers } from '../services/authService'
import type { LoginRequest, SetupAdminRequest } from '../types/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const login = useAuthStore((state) => state.login)
  const setupAdmin = useAuthStore((state) => state.setupAdmin)
  const navigate = useNavigate()

  useEffect(() => {
    const verifySetup = async () => {
      try {
        const response = await checkUsers()
        setNeedsSetup(response.needs_setup)
      } catch (error: any) {
        message.error(error.response?.data?.detail || 'No se pudo verificar la configuracion inicial')
      } finally {
        setCheckingSetup(false)
      }
    }

    verifySetup()
  }, [])

  const onFinish = async (values: LoginRequest) => {
    setLoading(true)
    try {
      await login(values)
      message.success('Bienvenido al Sistema RHINO')
      navigate('/')
    } catch (error: any) {
      if (error.response?.status === 401) {
        notification.error({
          message: 'Inicio de sesión fallido',
          description: 'El usuario o la contraseña son incorrectos',
          icon: <CloseCircleOutlined className="!text-red-500" />,
          placement: 'topRight',
          duration: 4,
        })
      } else {
        message.error(error.response?.data?.detail || 'Error al iniciar sesion')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSetupFinish = async (values: SetupAdminRequest) => {
    setLoading(true)
    try {
      await setupAdmin(values)
      message.success('Administrador creado correctamente')
      navigate('/')
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'No se pudo crear el administrador')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSetup) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#1890ff' }}>Sistema RHINO</h1>
          <p>{needsSetup ? 'Version 3.0 - Configuracion inicial' : 'Version 3.0 - Iniciar sesion'}</p>
        </div>

        {needsSetup ? (
          <>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="No hay usuarios registrados. Crea el administrador inicial."
            />
            <Form name="setup-admin" layout="vertical" onFinish={onSetupFinish}>
              <Form.Item name="nombres" rules={[{ required: true, message: 'Ingrese sus nombres' }]}>
                <Input placeholder="Nombres" size="large" />
              </Form.Item>
              <Form.Item name="apellidos" rules={[{ required: true, message: 'Ingrese sus apellidos' }]}>
                <Input placeholder="Apellidos" size="large" />
              </Form.Item>
              <Form.Item name="username" rules={[{ required: true, message: 'Ingrese un usuario' }]}>
                <Input prefix={<UserOutlined />} placeholder="Usuario administrador" size="large" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Ingrese una contrasena' },
                  { min: 6, message: 'Use al menos 6 caracteres' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Contrasena" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                  Crear administrador
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <Form name="login" onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: 'Ingrese su usuario' }]}>
              <Input prefix={<UserOutlined />} placeholder="Usuario" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Ingrese su contrasena' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Contrasena" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                Iniciar sesion
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  )
}
