import { useState, useEffect, useMemo } from 'react'
import { Modal, Table, Input, Tag, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import { getProductos } from '../services/productoService'
import categoriaService from '../services/categoriaService'

interface ProductoSelectorModalProps {
  visible: boolean
  onCancel: () => void
  onSelect: (producto: Producto) => void
}

export default function ProductoSelectorModal({ visible, onCancel, onSelect }: ProductoSelectorModalProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<number | null>(null)

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

  const filtered = useMemo(() => {
    let result = productos
    if (searchText) {
      const q = searchText.toLowerCase()
      result = result.filter(
        (p) =>
          p.codigo.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q),
      )
    }
    if (categoriaFilter) {
      result = result.filter((p) => p.categoria_id === categoriaFilter)
    }
    return result
  }, [productos, searchText, categoriaFilter])

  const catMap = useMemo(() => {
    const m = new Map<number, string>()
    categorias.forEach((c) => m.set(c.id, c.nombre))
    return m
  }, [categorias])

  const columns: ColumnsType<Producto> = [
    { title: 'Código', dataIndex: 'codigo', width: 80 },
    {
      title: 'Producto',
      key: 'producto',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {r.imagen && (
            <img
              src={r.imagen}
              alt=""
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          )}
          <div>
            <span style={{ fontWeight: 500 }}>{`[${r.codigo}] ${catMap.get(r.categoria_id ?? 0) ?? ''} - ${r.descripcion}`}</span>
            <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>{r.marca}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      width: 100,
      align: 'right',
      render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_actual',
      width: 70,
      align: 'center',
      render: (v: number, r: Producto) => {
        const color = v <= (r.stock_minimo ?? 0) ? 'red' : 'green'
        return <Tag color={color}>{v}</Tag>
      },
    },
  ]

  return (
      <Modal
        title="Seleccionar Producto"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
        className="responsive-modal"
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar por código, descripción o marca"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
            allowClear
          />
          <Select
            placeholder="Categoría"
            allowClear
            style={{ width: 160, minWidth: 140 }}
            value={categoriaFilter}
            onChange={setCategoriaFilter}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
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
