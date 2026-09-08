import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Grid, Typography } from 'antd'
import {
  LoginOutlined,
  WhatsAppOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  PrinterOutlined,
  AimOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  RightOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useEmpresaStore, useEmpresaColors } from '../stores/empresaStore'
import { resolveUrl } from '../utils/resolveUrl'
import { buildWaLink } from '../utils/whatsapp'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

const SERVICIOS = [
  {
    icon: <ShoppingOutlined />,
    titulo: 'Materiales de escritorio',
    descripcion: 'Hojas, bolígrafos, archivadores, cuadernos y todo lo necesario para tu oficina o negocio.',
    imagen:
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <AppstoreOutlined />,
    titulo: 'Material de limpieza',
    descripcion: 'Insumos de aseo y limpieza para mantener tus espacios impecables y saludables.',
    imagen:
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=1200&auto=format&fit=crop',
  },
  {
    icon: <PrinterOutlined />,
    titulo: 'Servicios de imprenta',
    descripcion: 'Impresiones, fotocopias y diseño impreso con la mejor calidad y atención personalizada.',
    imagen:
      'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=1200&auto=format&fit=crop',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const empresa = useEmpresaStore((state) => state.empresa)
  const { primary } = useEmpresaColors()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    loadEmpresa()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const irProductos = () => navigate('/productos')

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
      <style>{`
        @keyframes landingHeroIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .landing-hero-in { animation: landingHeroIn .65s cubic-bezier(.22,.8,.36,1) both; }
        .servicio-card {
          cursor: pointer;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .servicio-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.4);
        }
        .servicio-card:focus-visible {
          outline: 2px solid ${primary};
          outline-offset: 2px;
        }
      `}</style>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '12px 20px' : '16px 48px',
          background: 'rgba(26,26,46,0.88)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {empresa?.logo ? (
            <img
              src={resolveUrl(empresa.logo)}
              alt="Logo"
              style={{ height: isMobile ? 36 : 44, objectFit: 'contain' }}
            />
          ) : (
            <Text strong style={{ fontSize: isMobile ? 18 : 22, color: '#fff' }}>YCT</Text>
          )}
        </div>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 12 : 28,
            fontSize: 15,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {!isMobile && (
            <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.65)' }} onClick={() => scrollTo('inicio')}>
              Inicio
            </span>
          )}
          <span style={{ cursor: 'pointer', fontWeight: isMobile ? 600 : 400 }} onClick={irProductos}>
            Productos
          </span>
          {!isMobile && (
            <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.65)' }} onClick={() => scrollTo('mision-vision')}>
              Nosotros
            </span>
          )}
          {!isMobile && (
            <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.65)' }} onClick={() => scrollTo('contacto')}>
              Contacto
            </span>
          )}
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ borderRadius: 8, height: isMobile ? 36 : 40, padding: isMobile ? '0 14px' : '0 20px' }}
          >
            Iniciar sesión
          </Button>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <section
          id="inicio"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '72px 20px 56px' : '110px 24px 84px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -160,
              right: -140,
              width: 520,
              height: 520,
              pointerEvents: 'none',
              background: `radial-gradient(circle, ${primary}22 0%, transparent 62%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -220,
              left: -160,
              width: 560,
              height: 560,
              pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)',
            }}
          />

          <div className="landing-hero-in" style={{ position: 'relative', maxWidth: 900 }}>
            <Title
              level={1}
              style={{
                color: '#fff',
                marginBottom: 12,
                fontWeight: 700,
                fontSize: isMobile ? 32 : 44,
                letterSpacing: '-0.02em',
              }}
            >
              {empresa?.nombre || 'YCT Soluciones Integrales'}
            </Title>

            <Paragraph
              style={{
                fontSize: isMobile ? 17 : 19,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: 640,
                margin: '0 auto 28px',
                lineHeight: 1.6,
              }}
            >
              Proveedor de materiales de escritorio, limpieza e imprenta. Calidad y confianza para
              {' '}{empresa?.ciudad || 'su empresa'}.
            </Paragraph>

            <div style={{ maxWidth: 720, margin: '0 auto 36px' }}>
              <Paragraph
                italic
                style={{
                  fontSize: isMobile ? 18 : 21,
                  color: 'rgba(255,255,255,0.92)',
                  marginBottom: 0,
                  lineHeight: 1.65,
                }}
              >
                "La lealtad es de ambas partes: si te lo pido a ti, lo recibirás de mí"
              </Paragraph>
              <div
                style={{
                  width: 48,
                  height: 1,
                  background: 'rgba(255,255,255,0.28)',
                  margin: '18px auto 0',
                }}
              />
              <Text
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 13,
                  display: 'block',
                  marginTop: 12,
                }}
              >
                {empresa ? `Compromiso de ${empresa.nombre}` : 'Compromiso de YCT Soluciones Integrales'}
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: 40,
              }}
            >
              {SERVICIOS.map((s) => (
                <span
                  key={s.titulo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 999,
                    padding: '8px 18px',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: primary }} />
                  {s.titulo}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={irProductos}
                style={{
                  height: 52,
                  padding: '0 36px',
                  fontSize: 16,
                  borderRadius: 10,
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
                  borderRadius: 10,
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  background: 'transparent',
                }}
              >
                Ingresar al Sistema
              </Button>
            </div>
          </div>
        </section>

        <section id="servicios" style={{ padding: isMobile ? '56px 20px 64px' : '80px 24px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
          <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>
            ¿Qué ofrecemos?
          </Title>
          <Paragraph
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              marginBottom: 44,
            }}
          >
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
              <ServicioCard key={s.titulo} servicio={s} primary={primary} />
            ))}
          </div>
        </section>

        <section id="mision-vision" style={{ padding: isMobile ? '56px 20px 64px' : '80px 24px' }}>
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              maxWidth: 1080,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 22,
                alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: isMobile ? '28px 24px' : '34px 30px',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  background: primary,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <AimOutlined />
              </div>
              <div>
                <Title level={3} style={{ color: '#fff', marginBottom: 12, fontWeight: 600 }}>
                  Nuestra Misión
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, marginBottom: 0, lineHeight: 1.7 }}>
                  Brindar productos de escritorio, limpieza e imprenta de alta calidad, con precios
                  accesibles y atención personalizada, garantizando el abastecimiento oportuno que
                  nuestros clientes necesitan para el desarrollo de sus actividades.
                </Paragraph>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 22,
                alignItems: 'flex-start',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: isMobile ? '28px 24px' : '34px 30px',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.16)',
                  flexShrink: 0,
                }}
              >
                <EyeOutlined />
              </div>
              <div>
                <Title level={3} style={{ color: '#fff', marginBottom: 12, fontWeight: 600 }}>
                  Nuestra Visión
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, marginBottom: 0, lineHeight: 1.7 }}>
                  Ser la empresa líder en provisión de artículos de escritorio, limpieza e imprenta,
                  reconocida por la confianza de nuestros clientes, la calidad de nuestros productos
                  y el compromiso con nuestra comunidad.
                </Paragraph>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" style={{ padding: isMobile ? '56px 20px 64px' : '80px 24px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
          <Title level={2} style={{ color: '#fff', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>
            Contacto
          </Title>
          <Paragraph
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              marginBottom: 44,
            }}
          >
            Estamos para atenderte, escríbenos sin compromiso
          </Paragraph>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: isMobile ? 8 : 24,
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

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: 32,
            }}
          >
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
                borderRadius: 10,
                background: '#25D366',
                borderColor: '#25D366',
              }}
            >
              Escribir por WhatsApp
            </Button>
            <Button
              type="link"
              icon={<RightOutlined />}
              onClick={irProductos}
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}
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

function ServicioCard({
  servicio,
  primary,
}: {
  servicio: (typeof SERVICIOS)[number]
  primary: string
}) {
  const navigate = useNavigate()
  const [imgOk, setImgOk] = useState(true)

  const irProductos = () => navigate('/productos')

  return (
    <div
      role="button"
      tabIndex={0}
      className="servicio-card"
      onClick={irProductos}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          irProductos()
        }
      }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.35)',
          aspectRatio: '16 / 10',
        }}
      >
        {imgOk ? (
          <img
            src={servicio.imagen}
            alt={servicio.titulo}
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {servicio.icon}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.88) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {servicio.icon}
          </span>
          <Text strong style={{ color: '#fff', fontSize: 17, lineHeight: 1.3 }}>
            {servicio.titulo}
          </Text>
        </div>
      </div>

      <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Paragraph style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 18, lineHeight: 1.65 }}>
          {servicio.descripcion}
        </Paragraph>
        <div style={{ flex: 1 }} />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: primary,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Ver productos <ArrowRightOutlined style={{ fontSize: 12 }} />
        </span>
      </div>
    </div>
  )
}