import { useCallback, useRef, useState } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

interface UsePdfPreview {
  openPdf: (fetchBlob: () => Promise<Blob>, titulo: string, filename: string) => Promise<boolean>
  previewModal: JSX.Element
}

export default function usePdfPreview(): UsePdfPreview {
  const [visible, setVisible] = useState(false)
  const [titulo, setTitulo] = useState('Vista previa PDF')
  const [url, setUrl] = useState<string | null>(null)
  const fetchRef = useRef<(() => Promise<Blob>) | null>(null)
  const filenameRef = useRef('documento.pdf')
  const urlRef = useRef<string | null>(null)

  const closePdf = useCallback(() => {
    setVisible(false)
    if (urlRef.current) {
      window.URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    setUrl(null)
    fetchRef.current = null
  }, [])

  const openPdf = useCallback(async (fetchBlob: () => Promise<Blob>, docTitulo: string, filename: string) => {
    fetchRef.current = fetchBlob
    filenameRef.current = filename
    setTitulo(docTitulo)
    try {
      const blob = await fetchBlob()
      const newUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      if (urlRef.current) window.URL.revokeObjectURL(urlRef.current)
      urlRef.current = newUrl
      setUrl(newUrl)
      setVisible(true)
      return true
    } catch {
      message.error('Error al generar PDF')
      return false
    }
  }, [])

  const downloadPdf = useCallback(async () => {
    const fetchBlob = fetchRef.current
    if (!fetchBlob) return
    try {
      const blob = await fetchBlob()
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', filenameRef.current)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
      message.success('PDF descargado')
    } catch {
      message.error('Error al descargar PDF')
    }
  }, [])

  const previewModal = (
    <Modal
      title={titulo}
      open={visible}
      onCancel={closePdf}
      width={900}
      className="responsive-modal"
      footer={
        <Space>
          <Button onClick={closePdf}>Cerrar</Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPdf}>Descargar</Button>
        </Space>
      }
    >
      {url && (
        <iframe
          src={url}
          title="Vista previa PDF"
          className="w-full"
          style={{ height: '70vh', border: 'none' }}
        />
      )}
    </Modal>
  )

  return { openPdf, previewModal }
}
