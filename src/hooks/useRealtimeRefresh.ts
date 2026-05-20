import { useEffect, useRef } from 'react'
import { createWebSocketClient } from '../services/websocket'

export function useRealtimeRefresh(room: string, onRefresh: () => void) {
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    const client = createWebSocketClient(room, () => {
      onRefreshRef.current()
    })
    return () => {
      client.disconnect()
    }
  }, [room])
}
