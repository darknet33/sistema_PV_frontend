import { useState, useEffect, useMemo } from 'react'
import { Modal, Table, Input, Tag, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import { getProductos } from '../services/productoService'
import categoriaService from '../services/categoriaService'
import { calcularPrecioBase } from '../utils/pricing'
import { resolveUrl } from '../utils/resolveUrl'

interface ProductoSelectorModalProps {
  visible: boolean
  onCancel: () => void
  onSelect: (producto: Producto) => void
  showCostInfo?: boolean
}

export default function ProductoSelectorModal({ visible, onCancel, onSelect, showCostInfo = false }: ProductoSelectorModalProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<number | null>(null)
  const [procedenciaFilter, setProcedenciaFilter] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setLoading(true)
    Promise.all([
      getProductos(),
      categoriaService.getAll(),
    ])
      .then(([prods, cats]) => {
        setProductos(prods.filter((p) => p.activo !== false))
        setCategorias(cats)
      })
      .finally(() => setLoading(false))
  }, [visible])

  const procedenciaOptions = useMemo(() => {
    const vals = new Set<string>()
    productos.forEach((p) => {
      const v = (p.procedencia || '').trim()
      if (v) vals.add(v)
    })
    return Array.from(vals).sort().map((v) => ({ value: v, label: v }))
  }, [productos])

  const filtered = useMemo(() => {
    let result = productos
    if (searchText) {
      const q = searchText.toLowerCase()
      result = result.filter(
        (p) =>
          p.codigo.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          (p.procedencia || '').toLowerCase().includes(q),
      )
    }
    if (categoriaFilter) {
      result = result.filter((p) => p.categoria_id === categoriaFilter)
    }
    if (procedenciaFilter) {
      result = result.filter((p) => (p.procedencia || '') === procedenciaFilter)
    }
    return result
  }, [productos, searchText, categoriaFilter, procedenciaFilter])

  const catMap = useMemo(() => {
    const m = new Map<number, string>()
    categorias.forEach((c) => m.set(c.id, c.nombre))
    return m
  }, [categorias])

  const columns: ColumnsType<Producto> = [
    ...(showCostInfo ? [] : [{ title: 'Código', dataIndex: 'codigo', key: 'codigo', width: 80 }]),
    {
      title: 'Producto',
      key: 'producto',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {r.imagen && (
            <img
              src={resolveUrl(r.imagen)}
              alt=""
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          )}
          <div>
            <span style={{ fontWeight: 500 }}>{`[${r.codigo}] ${catMap.get(r.categoria_id ?? 0) ?? ''} - ${r.descripcion}`}</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              {r.marca && <span style={{ color: '#888', fontSize: 12 }}>{r.marca}</span>}
              {(r.procedencia || '') && <span style={{ color: '#aaa', fontSize: 12 }}>{r.procedencia}</span>}
            </div>
          </div>
        </div>
      ),
    },
    ...(showCostInfo
      ? [
          { title: 'Costo Bs.', dataIndex: 'precio', key: 'precio', width: 90, align: 'right' as const, render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
          { title: 'Utilidad Bs.', dataIndex: 'utilidad', key: 'utilidad', width: 90, align: 'right' as const, render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
          {
            title: 'Precio Base', key: 'precio_base', width: 100, align: 'right' as const,
            render: (_: unknown, r: Producto) => `Bs. ${calcularPrecioBase(Number(r.precio || 0), Number(r.utilidad || 0)).toFixed(2)}`,
          },
        ]
      : [
          {
            title: 'Precio', dataIndex: 'precio', key: 'precio', width: 100, align: 'right' as const,
            render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}`,
          },
        ]),
    {
      title: 'Stock', dataIndex: 'stock_actual', key: 'stock_actual', width: 90, align: 'center' as const,
      render: (v: number, r: Producto) => {
        const color = v <= (r.stock_minimo ?? 0) ? 'red' : 'green'
        const unit = r.unidad_principal?.unidad_abreviatura || ''
        return <Tag color={color}>{v} {unit}</Tag>
      },
    },
  ]

  return (
      <Modal
        title="Seleccionar Producto"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={showCostInfo ? 900 : 700}
        className="responsive-modal"
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar por código, descripción, marca o procedencia"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
            allowClear
          />
          <Select
            placeholder="Categoría"
            allowClear
            style={{ width: 150, minWidth: 130 }}
            value={categoriaFilter}
            onChange={setCategoriaFilter}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
          />
          <Select
            placeholder="Procedencia"
            allowClear
            showSearch
            style={{ width: 150, minWidth: 130 }}
            value={procedenciaFilter}
            onChange={setProcedenciaFilter}
            options={procedenciaOptions}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => {
              onSelect(record)
              onCancel()
            },
            style: { cursor: 'pointer' },
          })}
        />
    </Modal>
  )
}
