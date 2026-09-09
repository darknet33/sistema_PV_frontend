import { Button, Alert } from 'antd'
import { DownloadOutlined, InfoCircleOutlined, MobileOutlined } from '@ant-design/icons'
import { usePWAInstall } from '../hooks/usePWAInstall'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, isAndroid, install, dismiss } = usePWAInstall()

  if (isInstalled) return null

  // iOS instructions
  if (isIOS) {
    return (
      <Alert
        message="Instalar Sistema de Inventario en tu iPhone"
        description={
          <span>
            Para instalar: toca el botón <strong>Compartir</strong> (ícono de cuadrado con flecha) en la barra de herramientas y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
          </span>
        }
        type="info"
        icon={<MobileOutlined />}
        closable
        onClose={dismiss}
        style={{ marginBottom: 8 }}
      />
    )
  }

  // Android - show install button if we have the prompt, or show instructions
  if (isAndroid || isInstallable) {
    return (
      <Alert
        message="Instalar Sistema de Inventario"
        description={
          <span>
            Instala Sistema de Inventario para acceso rápido desde la pantalla de inicio.
          </span>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        action={
          <Button
            size="small"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={install}
          >
            Instalar
          </Button>
        }
        closable
        onClose={dismiss}
        style={{ marginBottom: 8 }}
      />
    )
  }

  return null
}
