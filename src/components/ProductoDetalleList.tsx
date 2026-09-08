import { Button, Image as AntImage } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
import StepperInput from './StepperInput'
import { resolveUrl } from '../utils/resolveUrl'

export interface DetalleItem {
  key: string
  producto_id: number | null
  producto_nombre: string
  producto_codigo: string
  producto_categoria: string
  cantidad: number | null
}

interface ProductoDetalleListProps<T extends DetalleItem> {
  items: T[]
  getImagen?: (item: T) => string | null | undefined
  getMarca?: (item: T) => string | undefined
  getProcedencia?: (item: T) => string | undefined
  getUnidad?: (item: T) => string | undefined
  getPrecio?: (item: T) => number | null | undefined
  getSubtotal?: (item: T) => number
  formatPrecio?: (value: number) => string
  onCantidadChange?: (key: string, val: number | null) => void
  onRemove?: (key: string) => void
  renderExtra?: (item: T) => ReactNode
  readOnly?: boolean
  quantityStep?: number
  quantityMin?: number
}

const DEFAULT_FORMAT = (v: number) => `Bs. ${v.toFixed(2)}`

export default function ProductoDetalleList<T extends DetalleItem>({
  items,
  getImagen,
  getMarca,
  getProcedencia,
  getUnidad,
  getPrecio,
  getSubtotal,
  formatPrecio = DEFAULT_FORMAT,
  onCantidadChange,
  onRemove,
  renderExtra,
  readOnly = false,
  quantityStep = 1,
  quantityMin = 1,
}: ProductoDetalleListProps<T>) {
  if (items.length === 0) {
    return <div className="text-center text-gray-400 py-6">Sin productos añadidos todavía. Vuelva al paso anterior para seleccionar.</div>
  }

  return (
    <div>
      {items.map((item) => {
        const imagen = getImagen?.(item)
        const marca = getMarca?.(item)
        const procedencia = getProcedencia?.(item)
        const unidad = getUnidad?.(item)
        const precio = getPrecio?.(item)
        const subtotal = getSubtotal?.(item)

        return (
          <div key={item.key} className="flex flex-wrap gap-3 items-center p-3 mb-2 border border-gray-100 rounded-lg bg-white">
            {imagen ? (
              <AntImage
                src={resolveUrl(imagen)}
                width={44}
                height={44}
                style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
              />
            ) : (
              <div className="w-[44px] h-[44px] rounded-md bg-gray-100 flex items-center justify-center text-gray-300 select-none shrink-0">
                -
              </div>
            )}

            <div className="flex-1 min-w-[160px]">
              <div className="text-sm font-medium leading-tight">
                {item.producto_codigo && (
                  <span className="text-gray-400 mr-1">[{item.producto_codigo}]</span>
                )}
                {item.producto_categoria && (
                  <span className="text-gray-400 mr-1">{item.producto_categoria} -</span>
                )}
                {item.producto_nombre}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {[marca, procedencia, unidad].filter(Boolean).join(' · ') || '-'}
              </div>
            </div>

            {precio != null && (
              <div className="text-right min-w-[90px]">
                <div className="text-sm font-medium">
                  {typeof precio === 'number' ? formatPrecio(precio) : '-'}
                </div>
                <div className="text-xs text-gray-400">P. unit.</div>
              </div>
            )}

            <div className="flex flex-col items-center gap-0.5">
              {readOnly ? (
                <div className="text-sm font-medium min-w-[48px] text-center">{item.cantidad ?? '-'}</div>
              ) : (
                <StepperInput
                  value={item.cantidad}
                  onChange={onCantidadChange ? (val) => onCantidadChange(item.key, val) : undefined}
                  min={quantityMin}
                  step={quantityStep}
                  disabled={!onCantidadChange}
                />
              )}
              {!readOnly && renderExtra?.(item)}
            </div>

            {subtotal != null && (
              <div className="text-right min-w-[90px]">
                <div className="text-sm font-semibold">{typeof subtotal === 'number' ? formatPrecio(subtotal) : '-'}</div>
                <div className="text-xs text-gray-400">Subtotal</div>
              </div>
            )}

            {!readOnly && onRemove && (
              <Button danger icon={<DeleteOutlined />} size="small" onClick={() => onRemove(item.key)} />
            )}
          </div>
        )
      })}
    </div>
  )
}