import { useMemo, useState } from 'react'
import { Table, Input, Select, Switch, Tag, Image as AntImage } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import { calcularPrecioBase } from '../utils/pricing'
import { resolveUrl } from '../utils/resolveUrl'
import StepperInput from './StepperInput'

interface UnidadOpcion {
  id: number
  nombre: string
  abreviatura: string
  factor: number
  es_principal: boolean
}

export interface SeleccionProducto {
  cantidad: number
  unidad_id?: number | null
}

interface WizardProductoSelectorProps {
  productos: Producto[]
  categorias: Categoria[]
  seleccion: Record<number, SeleccionProducto>
  onSeleccionChange: (seleccion: Record<number, SeleccionProducto>) => void
  showCostInfo?: boolean
  showUnidad?: boolean
  showIncluirImagenes?: boolean
  incluirImagenes?: boolean
  onIncluirImagenesChange?: (v: boolean) => void
  loading?: boolean
}

interface RowProducto extends Producto {
  key: number
}

const unidadesDe = (r: Producto): UnidadOpcion[] =>
  (r.unidades || []).map((u) => ({
    id: u.unidad_id,
    nombre: u.unidad_nombre,
    abreviatura: u.unidad_abreviatura,
    factor: Number(u.factor_conversion || 1),
    es_principal: !!u.es_principal,
  }))

const unidadDefault = (r: Producto): number | null =>
  r.unidad_principal?.unidad_id ?? unidadesDe(r)[0]?.id ?? null

export default function WizardProductoSelector({
  productos,
  categorias,
  seleccion,
  onSeleccionChange,
  showCostInfo = false,
  showUnidad = false,
  showIncluirImagenes = false,
  incluirImagenes = false,
  onIncluirImagenesChange,
  loading = false,
}: WizardProductoSelectorProps) {
  const [searchText, setSearchText] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<number | null>(null)
  const [procedenciaFilter, setProcedenciaFilter] = useState<string | null>(null)

  const procedenciaOptions = useMemo(() => {
    const vals = new Set<string>()
    productos.forEach((p) => {
      const v = (p.procedencia || '').trim()
      if (v) vals.add(v)
    })
    return Array.from(vals).sort().map((v) => ({ value: v, label: v }))
  }, [productos])

  const catMap = useMemo(() => {
    const m = new Map<number, string>()
    categorias.forEach((c) => m.set(c.id, c.nombre))
    return m
  }, [categorias])

  const filtered: RowProducto[] = useMemo(() => {
    let result: Producto[] = productos.filter((p) => p.activo !== false)
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
    return result.map((p) => ({ ...p, key: p.id }))
  }, [productos, searchText, categoriaFilter, procedenciaFilter])

  const selectedKeys = useMemo(() => Object.keys(seleccion).map(Number), [seleccion])

  const toggleSeleccion = (id: number) => {
    const next = { ...seleccion }
    if (next[id]) {
      delete next[id]
    } else {
      const prod = productos.find((p) => p.id === id)
      next[id] = { cantidad: 1, unidad_id: prod ? unidadDefault(prod) : null }
    }
    onSeleccionChange(next)
  }

  const setCantidad = (id: number, val: number | null) => {
    const prev = seleccion[id] || { cantidad: 1, unidad_id: null }
    onSeleccionChange({ ...seleccion, [id]: { ...prev, cantidad: Number(val || 1) } })
  }

  const setUnidad = (id: number, unidadId: number) => {
    const prev = seleccion[id] || { cantidad: 1, unidad_id: null }
    onSeleccionChange({ ...seleccion, [id]: { ...prev, unidad_id: unidadId } })
  }

  const columns: ColumnsType<RowProducto> = [
    {
      title: '',
      key: 'foto',
      width: 56,
      render: (_, r) => (
        <div onClick={(e) => e.stopPropagation()}>
          {r.imagen ? (
            <AntImage
              src={resolveUrl(r.imagen)}
              width={36}
              height={36}
              style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <div className="w-[36px] h-[36px] rounded bg-gray-100 flex items-center justify-center text-gray-300 select-none">-</div>
          )}
        </div>
      ),
    },
    {
      title: 'Producto',
      key: 'producto',
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 500 }}>{`[${r.codigo}] ${catMap.get(r.categoria_id ?? 0) ?? ''} - ${r.descripcion}`}</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            {r.marca && <span style={{ color: '#888', fontSize: 12 }}>{r.marca}</span>}
            {(r.procedencia || '') && <span style={{ color: '#aaa', fontSize: 12 }}>{r.procedencia}</span>}
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
            render: (_: unknown, r: RowProducto) => `Bs. ${calcularPrecioBase(Number(r.precio || 0), Number(r.utilidad || 0)).toFixed(2)}`,
          },
        ]
      : [
          {
            title: 'Precio', dataIndex: 'precio', key: 'precio', width: 100, align: 'right' as const,
            render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}`,
          },
        ]),
    {
      title: 'Stock / Cant.', key: 'stock_cantidad', width: 190,
      render: (_, r) => {
        const sel = seleccion[r.id]
        if (!sel) {
          const color = r.stock_actual <= (r.stock_minimo ?? 0) ? 'red' : 'green'
          const unit = r.unidad_principal?.unidad_abreviatura || ''
          return <Tag color={color}>{r.stock_actual} {unit}</Tag>
        }
        const unidades = unidadesDe(r)
        const factor = sel.unidad_id ? unidades.find((u) => u.id === sel.unidad_id)?.factor ?? 1 : 1
        const efectivo = (sel.cantidad || 1) * factor
        return (
          <div className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <StepperInput size="small" value={sel.cantidad} onChange={(val) => setCantidad(r.id, val)} min={1} step={1} />
            {showUnidad && unidades.length > 0 && (
              <Select
                size="small"
                className="w-[130px]"
                placeholder="Unidad"
                value={sel.unidad_id ?? undefined}
                onChange={(val) => setUnidad(r.id, val)}
                options={unidades.map((u) => ({ value: u.id, label: `${u.nombre} (${u.abreviatura || '-'})` }))}
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              />
            )}
            {efectivo > r.stock_actual && (
              <div className="text-red-500 text-xs leading-[14px]">
                Stock: {r.stock_actual} {r.unidad_principal?.unidad_abreviatura || ''}
              </div>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
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
          onChange={(v) => setCategoriaFilter(v ?? null)}
          options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
        />
        <Select
          placeholder="Procedencia"
          allowClear
          showSearch
          style={{ width: 150, minWidth: 130 }}
          value={procedenciaFilter}
          onChange={(v) => setProcedenciaFilter(v ?? null)}
          options={procedenciaOptions}
        />
        {showIncluirImagenes && (
          <div className="self-center ml-auto" onClick={(e) => e.stopPropagation()}>
            <Switch
              size="small"
              checked={!!incluirImagenes}
              onChange={(v) => onIncluirImagenesChange?.(v)}
              checkedChildren="Incluir imagen"
              unCheckedChildren="Sin imagen"
            />
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 8 }}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => {
            const byId = new Map(productos.map((p) => [p.id, p]))
            const next: Record<number, SeleccionProducto> = {}
            keys.forEach((k) => {
              const id = Number(k)
              const prev = seleccion[id]
              const prod = byId.get(id)
              next[id] = prev ? { ...prev } : { cantidad: 1, unidad_id: prod ? unidadDefault(prod) : null }
            })
            onSeleccionChange(next)
          },
        }}
        onRow={(r) => ({
          onClick: (e) => {
            const el = e.target as HTMLElement
            if (el.closest('.ant-table-selection-column')) return
            toggleSeleccion(r.id)
          },
        })}
        rowClassName={(r) => (seleccion[r.id] ? 'bg-blue-50' : '')}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
        <span className="text-sm text-gray-500">
          {selectedKeys.length > 0
            ? `${selectedKeys.length} producto(s) seleccionado(s)`
            : 'Haga clic en los productos para seleccionarlos y presione "Siguiente"'}
        </span>
      </div>
    </div>
  )
}