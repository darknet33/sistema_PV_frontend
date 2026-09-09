import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import App from './App'
import { useEmpresaStore, useEmpresaColors } from './stores/empresaStore'
import { syncFavicon } from './utils/favicon'
import './index.css'

dayjs.locale('es')

function FaviconSync() {
  const empresa = useEmpresaStore((state) => state.empresa)
  const primary = useEmpresaColors().primary

  React.useEffect(() => {
    syncFavicon(empresa?.logo, empresa?.color_principal || primary)
  }, [empresa, primary])

  return null
}

function ThemedApp() {
  const { primary } = useEmpresaColors()

  return (
    <ConfigProvider locale={esES} theme={{ token: { colorPrimary: primary } }}>
      <AntApp>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <FaviconSync />
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
)
