import { useNavigate } from 'react-router-dom'
import { Button, Typography } from 'antd'
import { LoginOutlined } from '@ant-design/icons'
import { useEmpresaStore, useEmpresaColors } from '../stores/empresaStore'
import { useEffect } from 'react'

const { Title, Paragraph, Text } = Typography

export default function LandingPage() {
  const navigate = useNavigate()
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const empresa = useEmpresaStore((state) => state.empresa)
  const { primary } = useEmpresaColors()

  useEffect(() => {
    loadEmpresa()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fff',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {empresa?.logo ? (
            <img src={empresa.logo} alt="Logo" style={{ height: 48, objectFit: 'contain' }} />
          ) : (
            <Text strong style={{ fontSize: 22, color: '#fff' }}>YCT</Text>
          )}
        </div>
        <Button
          type="primary"
          icon={<LoginOutlined />}
          size="large"
          onClick={() => navigate('/login')}
          style={{ borderRadius: 8 }}
        >
          Iniciar sesion
        </Button>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <Title level={1} style={{ color: '#fff', marginBottom: 8, fontWeight: 700 }}>
          {empresa?.nombre || 'YCT Soluciones Integrales'}
        </Title>

        <Paragraph
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 600,
            marginBottom: 16,
          }}
        >
          Proveedor de materiales de escritorio, limpieza e imprenta
        </Paragraph>

        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '24px 40px',
            marginBottom: 40,
            borderLeft: `4px solid ${primary}`,
          }}
        >
          <Paragraph
            italic
            style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: 0,
            }}
          >
            "La lealtad es de ambas partes: si te lo pido a ti, lo recibiras de mi"
          </Paragraph>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {['Materiales de escritorio', 'Material de limpieza', 'Servicios de imprenta'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 15,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          onClick={() => navigate('/login')}
          style={{
            height: 52,
            padding: '0 40px',
            fontSize: 16,
            borderRadius: 8,
            background: primary,
            borderColor: primary,
          }}
        >
          Ingresar al Sistema
        </Button>
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '20px 24px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 13,
        }}
      >
        {new Date().getFullYear()} {empresa?.nombre || 'YCT Soluciones Integrales'} &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
