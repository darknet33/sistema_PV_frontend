type MessageHandler = (data: { type: string; room: string }) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private room: string
  private onMessage: MessageHandler
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private disconnected = false

  constructor(room: string, onMessage: MessageHandler) {
    this.room = room
    this.onMessage = onMessage
    this.connect()
  }

  private getUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/api/ws/${this.room}`
  }

  private connect() {
    this.ws = new WebSocket(this.getUrl())
    this.ws.onmessage = (event) => {
      if (this.disconnected) return
      try {
        const data = JSON.parse(event.data)
        this.onMessage(data)
      } catch {
        // ignore malformed messages
      }
    }
    this.ws.onclose = () => {
      if (this.disconnected) return
      this.scheduleReconnect()
    }
    this.ws.onerror = () => {
      // onclose fires automatically after onerror
    }
  }

  private scheduleReconnect() {
    if (this.disconnected) return
    this.reconnectTimeout = setTimeout(() => {
      if (!this.disconnected) this.connect()
    }, 3000)
  }

  disconnect() {
    this.disconnected = true
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.ws) {
      const ws = this.ws
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => ws.close()
      } else {
        ws.close()
      }
      this.ws = null
    }
  }
}

export function createWebSocketClient(room: string, onMessage: MessageHandler): WebSocketClient {
  return new WebSocketClient(room, onMessage)
}

export type { MessageHandler }
