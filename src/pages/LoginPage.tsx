import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Spin, message, notification, Typography } from 'antd'
import {
  LockOutlined,
  UserOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useEmpresaStore, useEmpresaColors } from '../stores/empresaStore'
import { resolveUrl } from '../utils/resolveUrl'
import { checkUsers } from '../services/authService'
import type { LoginRequest, SetupAdminRequest } from '../types/auth'

const { Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const login = useAuthStore((state) => state.login)
  const setupAdmin = useAuthStore((state) => state.setupAdmin)
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const empresa = useEmpresaStore((state) => state.empresa)
  const { primary } = useEmpresaColors()
  const navigate = useNavigate()

  useEffect(() => {
    loadEmpresa()
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
      message.success('Bienvenido al Sistema de Inventario')
      navigate('/dashboard')
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
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'No se pudo crear el administrador')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSetup) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .login-dark-input input::placeholder,
        .login-dark-input .ant-input-prefix { color: rgba(255,255,255,0.45) !important; }
        .login-dark-input input { color: #fff; }
        .login-dark-input .ant-input-suffix { color: rgba(255,255,255,0.45) !important; }
        .login-dark-input .ant-input-password-icon { color: rgba(255,255,255,0.45) !important; }
      `}</style>

      {/* Decorative background circles */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `${primary}18`,
          top: -120,
          right: -100,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `${primary}10`,
          bottom: -80,
          left: -80,
          pointerEvents: 'none',
        }}
      />

      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 15,
          height: 40,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }}
      >
        Volver
      </Button>

      <Card
        style={{
          width: 420,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        styles={{
          body: { padding: '40px 36px 32px' },
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {empresa?.logo ? (
            <div
              style={{
                display: 'inline-flex',
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 14,
                marginBottom: 16,
              }}
            >
              <img
                src={resolveUrl(empresa.logo)}
                alt="Logo"
                style={{ maxHeight: 56, maxWidth: 180, objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: primary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <LockOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
          )}
          <h2
            style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 4,
              marginTop: 0,
            }}
          >
            {needsSetup ? 'Configuración Inicial' : 'Bienvenido'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 0 }}>
            {needsSetup
              ? 'Crea el usuario administrador para comenzar'
              : empresa?.razon_social?.toUpperCase() || 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        {needsSetup ? (
          <>
            <Alert
              type="info"
              showIcon
              style={{
                marginBottom: 20,
                borderRadius: 10,
                background: 'rgba(22,119,255,0.1)',
                border: '1px solid rgba(22,119,255,0.25)',
              }}
              message={
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>
                  No hay usuarios registrados. Crea el administrador inicial.
                </span>
              }
            />
            <Form name="setup-admin" layout="vertical" onFinish={onSetupFinish} requiredMark={false}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Form.Item
                  name="nombres"
                  rules={[{ required: true, message: 'Ingrese sus nombres' }]}
                  style={{ flex: 1, marginBottom: 16 }}
                >
                  <Input
                    placeholder="Nombres"
                    size="large"
                    className="login-dark-input"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      color:'rgba(255,255,255,1)',
                      borderRadius: 10,
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="apellidos"
                  rules={[{ required: true, message: 'Ingrese sus apellidos' }]}
                  style={{ flex: 1, marginBottom: 16 }}
                >
                  <Input
                    placeholder="Apellidos"
                    size="large"
                    className="login-dark-input"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      color:'rgba(255,255,255,1)',
                      borderRadius: 10,
                    }}
                  />
                </Form.Item>
              </div>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Ingrese un usuario' }]}
                style={{ marginBottom: 16 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
                  placeholder="Usuario administrador"
                  size="large"
                  className="login-dark-input"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color:'rgba(255,255,255,1)',
                    borderRadius: 10,
                  }}
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Ingrese una contrasena' },
                  { min: 6, message: 'Use al menos 6 caracteres' },
                ]}
                style={{ marginBottom: 24 }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
                  placeholder="Contrasena"
                  size="large"
                  className="login-dark-input"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color:'rgba(255,255,255,1)',
                    borderRadius: 10,
                  }}
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  icon={<UserAddOutlined />}
                  style={{
                    height: 48,
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 15,
                    background: primary,
                    borderColor: primary,
                  }}
                >
                  Crear administrador
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <Form name="login" onFinish={onFinish} requiredMark={false}>
            <Form.Item name="username" rules={[{ required: true, message: 'Ingrese su usuario' }]} style={{ marginBottom: 16 }}>
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
                placeholder="Usuario"
                size="large"
                autoComplete="username"
                className="login-dark-input"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color:'rgba(255,255,255,1)',
                  borderRadius: 10,
                }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Ingrese su contrasena' }]} style={{ marginBottom: 24 }}>
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
                placeholder="Contrasena"
                size="large"
                autoComplete="current-password"
                className="login-dark-input"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color:'rgba(255,255,255,1)',
                  borderRadius: 10,
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                icon={<LoginOutlined />}
                style={{
                  height: 48,
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                  background: primary,
                  borderColor: primary,
                }}
              >
                Iniciar sesion
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Rembix Copyright © 2026
          </Text>
        </div>
      </Card>
    </div>
  )
}
