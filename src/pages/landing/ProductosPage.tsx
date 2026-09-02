import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Input, Spin, Empty, Tag, Grid, message } from 'antd'
import {
  LoginOutlined,
  ArrowLeftOutlined,
  WhatsAppOutlined,
  ShoppingOutlined,
  SearchOutlined,
  BarcodeOutlined,
  TagOutlined,
  GlobalOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useEmpresaStore, useEmpresaColors } from '../../stores/empresaStore'
import { resolveUrl } from '../../utils/resolveUrl'
import { buildWaLink } from '../../utils/whatsapp'
import { getProductos } from '../../services/productoService'
import type { Producto } from '../../types/producto'

const { Title, Paragraph, Text } = Typography
const { useBreakpoint } = Grid

function unidadDelProducto(producto: Producto): string {
  const u = producto.unidad_principal
  return u?.unidad_abreviatura || u?.unidad_nombre || 'unid'
}

export default function ProductosLandingPage() {
  const navigate = useNavigate()
  const empresa = useEmpresaStore((state) => state.empresa)
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const { primary } = useEmpresaColors()

  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    loadEmpresa()
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    getProductos()
      .then((data) => {
        if (active) setProductos(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (active) message.error('Error al cargar los productos')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const disponibles = useMemo(() => {
    return productos.filter((p) => (p.activo !== false) && Number(p.stock_actual) > 0)
  }, [productos])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return disponibles
    return disponibles.filter((p) => {
      return (
        p.codigo?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.marca?.toLowerCase().includes(q) ||
        p.procedencia?.toLowerCase().includes(q)
      )
    })
  }, [disponibles, search])

  const hacerPedido = (producto: Producto) => {
    const nombre = empresa?.nombre || 'Su empresa'
    const mensaje =
      `Hola ${nombre}, quiero realizar un pedido del siguiente producto:\n\n` +
      `- Código: ${producto.codigo}\n` +
      `- Descripción: ${producto.descripcion}\n` +
      `- Marca: ${producto.marca || '—'}\n` +
      `- Procedencia: ${producto.procedencia || '—'}\n` +
      `- Disponible: ${producto.stock_actual} ${unidadDelProducto(producto)}`
    const link = buildWaLink(empresa?.telefono, mensaje)
    if (!link) {
      message.warning('La empresa no tiene un teléfono registrado para WhatsApp')
      return
    }
    window.open(link, '_blank', 'noopener,noreferrer')
  }

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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {empresa?.logo ? (
            <img src={resolveUrl(empresa.logo)} alt="Logo" style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <Text strong style={{ fontSize: 20, color: '#fff' }}>YCT</Text>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            style={{ borderRadius: 8 }}
          >
            Inicio
          </Button>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            style={{ borderRadius: 8 }}
          >
            Iniciar sesión
          </Button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{ color: '#fff', marginBottom: 8, fontWeight: 700 }}>
            Nuestros Productos
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, maxWidth: 620, margin: '0 auto' }}>
            Explora el catálogo con stock disponible y realiza tu pedido directamente por WhatsApp.
          </Paragraph>
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto 32px' }}>
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
            placeholder="Buscar por código, descripción, marca o procedencia"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            description={<Text style={{ color: 'rgba(255,255,255,0.6)' }}>No hay productos con stock disponible</Text>}
            style={{ padding: 60 }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            {filtered.map((producto) => (
              <ProductoCardView key={producto.id} producto={producto} onPedido={() => hacerPedido(producto)} primary={primary} />
            ))}
          </div>
        )}
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

function ProductoCardView({
  producto,
  onPedido,
  primary,
}: {
  producto: Producto
  onPedido: () => void
  primary: string
}) {
  const unidad = unidadDelProducto(producto)
  const tieneImagen = Boolean(producto.imagen)

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 28px rgba(0,0,0,0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {tieneImagen ? (
          <img src={resolveUrl(producto.imagen)} alt={producto.descripcion} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ShoppingOutlined style={{ fontSize: 44, color: 'rgba(255,255,255,0.35)' }} />
        )}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Tag color="green" style={{ fontWeight: 600 }}>
            {producto.activo !== false ? 'Disponible' : 'Agotado'}
          </Tag>
        </div>
      </div>

      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Text strong style={{ color: '#fff', fontSize: 16, lineHeight: 1.4 }}>
          {producto.descripcion}
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarcodeOutlined /> Código: <Text style={{ color: '#fff' }}>{producto.codigo}</Text>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagOutlined /> Marca: <Text style={{ color: '#fff' }}>{producto.marca || '—'}</Text>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GlobalOutlined /> Procedencia: <Text style={{ color: '#fff' }}>{producto.procedencia || '—'}</Text>
          </span>
        </div>

        <div
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 12px',
          }}
        >
          <InboxOutlined style={{ color: 'rgba(255,255,255,0.8)' }} />
          <Text strong style={{ color: '#fff' }}>
            Stock: {producto.stock_actual} {unidad}
          </Text>
        </div>

        <div style={{ flex: 1 }} />

        <Button
          type="primary"
          block
          size="large"
          icon={<WhatsAppOutlined />}
          onClick={onPedido}
          style={{ borderRadius: 8, background: primary, borderColor: primary }}
        >
          Realizar el pedido
        </Button>
      </div>
    </div>
  )
}