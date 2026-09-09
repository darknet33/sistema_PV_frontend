import { Button, Alert } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { usePWAUpdate } from '../hooks/usePWAUpdate'

export default function PWAUpdateBanner() {
  const { needRefresh, updateServiceWorker, closePrompt } = usePWAUpdate()

  if (!needRefresh) return null

  return (
    <Alert
      message="Nueva versión disponible"
      description="Hay una actualización de la aplicación disponible."
      type="info"
      icon={<SyncOutlined spin />}
      action={
        <Button
          size="small"
          type="primary"
          onClick={updateServiceWorker}
        >
          Actualizar
        </Button>
      }
      closable
      onClose={closePrompt}
      style={{ marginBottom: 8 }}
    />
  )
}
