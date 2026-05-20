import { useState, useMemo } from 'react'
import dayjs from 'dayjs'

interface FiltersConfig<T> {
  data: T[]
  dateKey?: keyof T
  searchKeys?: (keyof T)[]
}

export function useFilters<T extends Record<string, unknown>>({ data, dateKey, searchKeys }: FiltersConfig<T>) {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...data]

    if (search && searchKeys && searchKeys.length > 0) {
      const q = search.toLowerCase()
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const v = item[key]
          return v != null && String(v).toLowerCase().includes(q)
        })
      )
    }

    if (estadoFilter) {
      const estadoKey = (dateKey ? 'estado_nombre' : 'estado_nombre') as keyof T
      result = result.filter((item) => item[estadoKey] === estadoFilter)
    }

    if (dateRange[0] && dateRange[1] && dateKey) {
      const start = dateRange[0].startOf('day')
      const end = dateRange[1].endOf('day')
      result = result.filter((item) => {
        const d = dayjs(item[dateKey] as string)
        return d.isValid() && d.isAfter(start) && d.isBefore(end)
      })
    }

    return result
  }, [data, search, estadoFilter, dateRange, dateKey, searchKeys])

  const resetFilters = () => {
    setSearch('')
    setEstadoFilter(null)
    setDateRange([null, null])
  }

  return {
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    dateRange,
    setDateRange,
    filtered,
    resetFilters,
  }
}
