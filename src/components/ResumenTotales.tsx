import type { ReactNode } from 'react'

interface ResumenTotalesProps {
  subtotal: number
  total: number
  conFactura?: boolean
  iva?: number
  it?: number
  descuentoPct?: number
  descuento?: number
  extra?: ReactNode
}

export default function ResumenTotales({
  subtotal,
  total,
  conFactura = false,
  iva,
  it,
  descuentoPct,
  descuento,
  extra,
}: ResumenTotalesProps) {
  const ivaVal = Number(iva || 0)
  const itVal = Number(it || 0)
  const descPct = Number(descuentoPct || 0)
  const descVal = Number(descuento || 0)

  return (
    <div className="mt-2 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <strong>Resumen</strong>
        {extra}
      </div>
      <div className="text-right font-bold">
        {descPct > 0 && <div className="text-[15px]">Subtotal: Bs. {subtotal.toFixed(2)}</div>}
        {conFactura && (
          <div className="font-normal text-sm text-blue-500">IVA (13% inc.): Bs. {ivaVal.toFixed(2)}</div>
        )}
        {conFactura && (
          <div className="font-normal text-sm text-orange-500">IT (3% inc.): Bs. {itVal.toFixed(2)}</div>
        )}
        {descPct > 0 && (
          <div className="font-normal text-sm text-green-500">
            Descuento ({descPct}%): -Bs. {descVal.toFixed(2)}
          </div>
        )}
        <div className="text-lg mt-1">Total: Bs. {total.toFixed(2)}</div>
      </div>
    </div>
  )
}