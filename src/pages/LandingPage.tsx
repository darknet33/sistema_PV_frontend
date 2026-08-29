import { useNavigate } from 'react-router-dom'
import { Button, Typography } from 'antd'
import {
  LoginOutlined,
  WhatsAppOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  PrinterOutlined,
  AimOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useEmpresaStore, useEmpresaColors } from '../stores/empresaStore'
import { resolveUrl } from '../utils/resolveUrl'
import { buildWaLink } from '../utils/whatsapp'
import { useEffect } from 'react'

const { Title, Paragraph, Text } = Typography

const SERVICIOS = [
  {
    icon: <ShoppingOutlined />,
    titulo: 'Materiales de escritorio',
    descripcion: 'Hojas, bolígrafos, archivadores, cuadernos y todo lo necesario para tu oficina o negocio.',
  },
  {
    icon: <AppstoreOutlined />,
    titulo: 'Material de limpieza',
    descripcion: 'Insumos de aseo y limpieza para mantener tus espacios impecables y saludables.',
  },
  {
    icon: <PrinterOutlined />,
    titulo: 'Servicios de imprenta',
    descripcion: 'Impresiones, fotocopias y diseño impreso con la mejor calidad y atención personalizada.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const empresa = useEmpresaStore((state) => state.empresa)
  const { primary, secondary } = useEmpresaColors()

  useEffect(() => {
    loadEmpresa()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const waLink = buildWaLink(
    empresa?.telefono,
    `Hola ${empresa?.nombre || ''}! Quiero hacer una consulta sobre sus productos y servicios.`,
  )

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
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 48px',
          background: 'rgba(26,26,46,0.85)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {empresa?.logo ? (
            <img src={resolveUrl(empresa.logo)} alt="Logo" style={{ height: 44, objectFit: 'contain' }} />
          ) : (
            <Text strong style={{ fontSize: 22, color: '#fff' }}>YCT</Text>
          )}
        </div>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            fontSize: 15,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('inicio')}>Inicio</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}>Productos</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('mision')}>Misión</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('vision')}>Visión</span>
          <span style={{ cursor: 'pointer' }} onClick={() => scrollTo('contacto')}>Contacto</span>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ borderRadius: 8 }}
          >
            Iniciar sesión
          </Button>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <section
          id="inicio"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '90px 24px 70px',
            textAlign: 'center',
          }}
        >
          <Title level={1} style={{ color: '#fff', marginBottom: 8, fontWeight: 700, fontSize: 44 }}>
            {empresa?.nombre || 'YCT Soluciones Integrales'}
          </Title>

          <Paragraph
            style={{
              fontSize: 19,
              color: 'rgba(255,255,255,0.75)',
              maxWidth: 640,
              marginBottom: 24,
            }}
          >
            Proveedor de materiales de escritorio, limpieza e imprenta. Calidad y confianza para
            {' '}{empresa?.ciudad || 'su empresa'}.
          </Paragraph>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '22px 40px',
              marginBottom: 40,
              borderLeft: `4px solid ${primary}`,
              maxWidth: 720,
            }}
          >
            <Paragraph
              italic
              style={{
                fontSize: 19,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 0,
              }}
            >
              "La lealtad es de ambas partes: si te lo pido a ti, lo recibirás de mí"
            </Paragraph>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
            {SERVICIOS.map((s) => (
              <div
                key={s.titulo}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '10px 22px',
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {s.titulo}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<AppstoreOutlined />}
              onClick={() => navigate('/productos')}
              style={{
                height: 52,
                padding: '0 36px',
                fontSize: 16,
                borderRadius: 8,
                background: primary,
                borderColor: primary,
              }}
            >
              Ver Nuestros Productos
            </Button>
            <Button
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 52,
                padding: '0 36px',
                fontSize: 16,
                borderRadius: 8,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                background: 'transparent',
              }}
            >
              Ingresar al Sistema
            </Button>
          </div>
        </section>

        <section
          id="servicios"
          style={{ padding: '60px 24px', backgroundColor: 'rgba(0,0,0,0.18)' }}
        >
          <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 8 }}>
            ¿Qué ofrecemos?
          </Title>
          <Paragraph style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 40 }}>
            Productos y servicios pensados para tu negocio
          </Paragraph>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
              maxWidth: 1080,
              margin: '0 auto',
            }}
          >
            {SERVICIOS.map((s) => (
              <div
                key={s.titulo}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '28px 24px',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    background: primary,
                    color: '#fff',
                    marginBottom: 18,
                  }}
                >
                  {s.icon}
                </div>
                <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                  {s.titulo}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 0 }}>
                  {s.descripcion}
                </Paragraph>
              </div>
            ))}
          </div>
        </section>

        <section id="mision" style={{ padding: '70px 24px' }}>
          <div
            style={{
              maxWidth: 860,
              margin: '0 auto',
              display: 'flex',
              gap: 28,
              alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '36px 32px',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                background: primary,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <AimOutlined />
            </div>
            <div>
              <Title level={2} style={{ color: '#fff', marginBottom: 12 }}>
                Nuestra Misión
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 0 }}>
                Brindar productos de escritorio, limpieza e imprenta de alta calidad, con precios
                accesibles y atención personalizada, garantizando el abastecimiento oportuno que
                nuestros clientes necesitan para el desarrollo de sus actividades.
              </Paragraph>
            </div>
          </div>
        </section>

        <section id="vision" style={{ padding: '30px 24px 70px' }}>
          <div
            style={{
              maxWidth: 860,
              margin: '0 auto',
              display: 'flex',
              gap: 28,
              alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '36px 32px',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                background: secondary,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <EyeOutlined />
            </div>
            <div>
              <Title level={2} style={{ color: '#fff', marginBottom: 12 }}>
                Nuestra Visión
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 0 }}>
                Ser la empresa líder en provisión de artículos de escritorio, limpieza e imprenta,
                reconocida por la confianza de nuestros clientes, la calidad de nuestros productos
                y el compromiso con nuestra comunidad.
              </Paragraph>
            </div>
          </div>
        </section>

        <section id="contacto" style={{ padding: '60px 24px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
          <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 8 }}>
            Contacto
          </Title>
          <Paragraph style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 40 }}>
            Estamos para atenderte, escribenos sin compromiso
          </Paragraph>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 24,
              maxWidth: 1080,
              margin: '0 auto',
            }}
          >
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <PhoneOutlined style={{ fontSize: 30, color: primary }} />
              <Title level={5} style={{ color: '#fff', marginTop: 12, marginBottom: 4 }}>
                Teléfono / WhatsApp
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>
                {empresa?.telefono || '—'}
              </Paragraph>
            </div>
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <MailOutlined style={{ fontSize: 30, color: primary }} />
              <Title level={5} style={{ color: '#fff', marginTop: 12, marginBottom: 4 }}>
                Correo
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>
                {empresa?.correo || '—'}
              </Paragraph>
            </div>
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <EnvironmentOutlined style={{ fontSize: 30, color: primary }} />
              <Title level={5} style={{ color: '#fff', marginTop: 12, marginBottom: 4 }}>
                Dirección
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>
                {empresa ? `${empresa.direccion}, ${empresa.ciudad}` : '—'}
              </Paragraph>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              icon={<WhatsAppOutlined />}
              href={waLink || undefined}
              target="_blank"
              rel="noopener noreferrer"
              disabled={!waLink}
              style={{
                height: 50,
                padding: '0 36px',
                fontSize: 16,
                borderRadius: 8,
                background: '#25D366',
                borderColor: '#25D366',
              }}
            >
              Escribir por WhatsApp
            </Button>
            <Button
              type="link"
              icon={<RightOutlined />}
              onClick={() => navigate('/productos')}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginLeft: 8 }}
            >
              Ver productos disponibles
            </Button>
          </div>
        </section>
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