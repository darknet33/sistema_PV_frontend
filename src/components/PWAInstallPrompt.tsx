import { Button, Alert } from 'antd'
import { DownloadOutlined, InfoCircleOutlined, MobileOutlined } from '@ant-design/icons'
import { usePWAInstall } from '../hooks/usePWAInstall'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, install, dismiss } = usePWAInstall()

  if (isInstalled) return null

  if (isIOS) {
    return (
      <Alert
        message="Agregar a pantalla de inicio"
        description={
          <span>
            Para instalar: toca el botón <strong>Compartir</strong> (ícono de cuadrado con flecha) y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
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

  if (!isInstallable) return null

  return (
    <Alert
      message="Instalar aplicación"
        description="Instala el sistema para acceso rápido desde la pantalla de inicio."
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
