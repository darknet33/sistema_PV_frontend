import { create } from 'zustand'
import type { Empresa } from '../types/empresa'
import { getEmpresa } from '../services/empresaService'

export const DEFAULT_PRIMARY = '#1677ff'
export const DEFAULT_SECONDARY = '#001529'

interface EmpresaState {
  empresa: Empresa | null
  loaded: boolean
  loadEmpresa: () => Promise<void>
  setEmpresa: (data: Empresa) => void
}

export const useEmpresaStore = create<EmpresaState>((set) => ({
  empresa: null,
  loaded: false,
  loadEmpresa: async () => {
    try {
      const data = await getEmpresa()
      set({ empresa: data, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },
  setEmpresa: (data) => set({ empresa: data }),
}))

export function useEmpresaColors() {
  const empresa = useEmpresaStore((state) => state.empresa)
  return {
    primary: empresa?.color_principal || DEFAULT_PRIMARY,
    secondary: empresa?.color_secundario || DEFAULT_SECONDARY,
  }
}
