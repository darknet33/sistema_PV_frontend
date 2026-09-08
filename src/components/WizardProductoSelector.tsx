import { useMemo, useState } from 'react'
import { Table, Input, Select, Tag, Image as AntImage, Grid } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import { calcularPrecioBase } from '../utils/pricing'
import { resolveUrl } from '../utils/resolveUrl'
import StepperInput from './StepperInput'

const { useBreakpoint } = Grid

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
  showCostOnly?: boolean
  showUnidad?: boolean
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
  showCostOnly = false,
  showUnidad = false,
  loading = false,
}: WizardProductoSelectorProps) {
  const screens = useBreakpoint()
  const isMobile = !screens.md
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
      width: 280,
      render: (_, r) => (
        <div style={{ minWidth: 200, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          <span style={{ fontWeight: 500 }}>{`[${r.codigo}] ${catMap.get(r.categoria_id ?? 0) ?? ''} - ${r.descripcion}`}</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
            {r.marca && <span style={{ color: '#888', fontSize: 12 }}>{r.marca}</span>}
            {(r.procedencia || '') && <span style={{ color: '#aaa', fontSize: 12 }}>{r.procedencia}</span>}
          </div>
        </div>
      ),
    },
    ...(showCostOnly
      ? [
          { title: 'Costo Bs.', dataIndex: 'precio', key: 'precio', width: 90, align: 'right' as const, render: (v: number) => `Bs. ${Number(v || 0).toFixed(2)}` },
        ]
      : showCostInfo
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
        const color = r.stock_actual <= (r.stock_minimo ?? 0) ? 'red' : 'green'
        const unit = r.unidad_principal?.unidad_abreviatura || ''
        const unidades = unidadesDe(r)
        return (
          <div className="flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Tag color={color}>{r.stock_actual} {unit}</Tag>
            {sel && (
              <>
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
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className={isMobile ? 'flex flex-col gap-2 mb-3' : 'flex flex-wrap gap-2 mb-3'}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Buscar por código, descripción, marca o procedencia"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className={isMobile ? 'w-full' : ''}
          style={isMobile ? undefined : { flex: 1, minWidth: 180 }}
        />
        <div className={isMobile ? 'flex gap-2' : ''}>
          <Select
            placeholder="Categoría"
            allowClear
            className={isMobile ? 'flex-1' : ''}
            style={isMobile ? undefined : { width: 150, minWidth: 130 }}
            value={categoriaFilter}
            onChange={(v) => setCategoriaFilter(v ?? null)}
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
          />
          <Select
            placeholder="Procedencia"
            allowClear
            showSearch
            className={isMobile ? 'flex-1' : ''}
            style={isMobile ? undefined : { width: 150, minWidth: 130 }}
            value={procedenciaFilter}
            onChange={(v) => setProcedenciaFilter(v ?? null)}
            options={procedenciaOptions}
          />
        </div>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((r) => {
            const sel = seleccion[r.id]
            const isSel = !!sel
            const unidades = unidadesDe(r)
            const color = r.stock_actual <= (r.stock_minimo ?? 0) ? 'red' : 'green'
            const unitAbb = r.unidad_principal?.unidad_abreviatura || ''
            return (
              <div
                key={r.id}
                onClick={() => toggleSeleccion(r.id)}
                className={`cursor-pointer rounded-lg border p-2 flex flex-col gap-1.5 transition-colors ${isSel ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {r.imagen ? (
                    <AntImage
                      src={resolveUrl(r.imagen)}
                      width={36}
                      height={36}
                      style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    />
                  ) : (
                    <div className="w-[36px] h-[36px] rounded bg-gray-100 flex items-center justify-center text-gray-300 select-none shrink-0">-</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium leading-tight line-clamp-2">
                      <span className="text-gray-400">[{r.codigo}]</span> {catMap.get(r.categoria_id ?? 0) ?? ''} - {r.descripcion}
                    </div>
                    {(r.marca || r.procedencia) && (
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {[r.marca, r.procedencia].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                {showCostOnly ? (
                  <div className="text-xs font-semibold">Costo: Bs. {Number(r.precio || 0).toFixed(2)}</div>
                ) : showCostInfo ? (
                  <div className="text-[11px] leading-tight text-gray-600">
                    <div className="flex justify-between"><span className="text-gray-400">Cost.</span><span>Bs. {Number(r.precio || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Util.</span><span>Bs. {Number(r.utilidad || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-xs font-semibold text-gray-800"><span className="text-gray-400">P. base</span><span>Bs. {calcularPrecioBase(Number(r.precio || 0), Number(r.utilidad || 0)).toFixed(2)}</span></div>
                  </div>
                ) : (
                  <div className="text-xs font-semibold">Bs. {Number(r.precio || 0).toFixed(2)}</div>
                )}

                <div className="flex items-center justify-between">
                  <Tag color={color} className="!m-0 !text-[10px] !px-1.5 !py-0">{r.stock_actual} {unitAbb}</Tag>
                </div>

                {isSel && (
                  <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <StepperInput size="small" value={sel.cantidad} onChange={(val) => setCantidad(r.id, val)} min={1} step={1} />
                    {showUnidad && unidades.length > 0 && (
                      <Select
                        size="small"
                        className="w-full"
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
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 8 }}
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
      )}

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