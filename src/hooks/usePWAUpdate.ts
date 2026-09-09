import { useState, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

interface UsePWAUpdateReturn {
  needRefresh: boolean
  updateServiceWorker: () => Promise<void>
  closePrompt: () => void
}

export function usePWAUpdate(): UsePWAUpdateReturn {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onRegisteredSW(_swUrl, reg) {
        setRegistration(reg ?? null)
      }
    })
  }, [])

  const updateServiceWorker = async () => {
    if (registration) {
      await registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      setNeedRefresh(false)
      window.location.reload()
    }
  }

  const closePrompt = () => {
    setNeedRefresh(false)
  }

  return {
    needRefresh,
    updateServiceWorker,
    closePrompt
  }
}
