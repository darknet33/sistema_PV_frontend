import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Upload, ColorPicker, Grid, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import PageHeader from '../../components/PageHeader'
import { getEmpresa, updateEmpresa, uploadEmpresaLogo, deleteEmpresaLogo } from '../../services/empresaService'
import { useEmpresaStore, DEFAULT_PRIMARY, DEFAULT_SECONDARY } from '../../stores/empresaStore'
import type { EmpresaUpdate } from '../../types/empresa'

const { useBreakpoint } = Grid

export default function EmpresaPage() {
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const empresa = useEmpresaStore((state) => state.empresa)
  const loadEmpresa = useEmpresaStore((state) => state.loadEmpresa)
  const setEmpresa = useEmpresaStore((state) => state.setEmpresa)

  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([])
  const [colorPrincipal, setColorPrincipal] = useState(DEFAULT_PRIMARY)
  const [colorSecundario, setColorSecundario] = useState(DEFAULT_SECONDARY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEmpresa()
  }, [loadEmpresa])

  useEffect(() => {
    if (empresa) {
      form.setFieldsValue({
        nombre: empresa.nombre,
        razon_social: empresa.razon_social,
        nit: empresa.nit,
        telefono: empresa.telefono,
        correo: empresa.correo,
        direccion: empresa.direccion,
        ciudad: empresa.ciudad,
      })
      setColorPrincipal(empresa.color_principal || DEFAULT_PRIMARY)
      setColorSecundario(empresa.color_secundario || DEFAULT_SECONDARY)
      setLogoFileList(
        empresa.logo
          ? [{ uid: '-1', name: 'logo', status: 'done', url: empresa.logo }]
          : []
      )
    }
  }, [empresa, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const data: EmpresaUpdate = {
        ...values,
        color_principal: colorPrincipal,
        color_secundario: colorSecundario,
      }

      setSaving(true)
      await updateEmpresa(data)

      const pending = logoFileList.find((f) => f.originFileObj)
      if (pending?.originFileObj) {
        await uploadEmpresaLogo(pending.originFileObj as File)
      } else if (empresa?.logo && logoFileList.length === 0) {
        await deleteEmpresaLogo()
      }

      const final = await getEmpresa()
      setEmpresa(final)
      message.success('Datos de la empresa guardados')
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Empresa" />

      <Card
        title="DATOS DE LA EMPRESA"
        className="max-w-[720px]"
        styles={{ title: { textTransform: 'uppercase', fontSize: 16 } }}
      >
        <div className="flex flex-wrap gap-6">
          <div className="w-full md:w-[180px] flex flex-col items-center">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={logoFileList}
              accept=".jpg,.jpeg,.png,.gif,.webp"
              beforeUpload={() => false}
              onChange={({ fileList }) => setLogoFileList(fileList)}
            >
              {logoFileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 4 }}>Logo</div>
                </div>
              )}
            </Upload>
          </div>

          <Form form={form} layout="vertical" className="flex-1 min-w-[280px]">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4`}>
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'El nombre es requerido' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="razon_social" label="Razón social">
                <Input />
              </Form.Item>
              <Form.Item name="nit" label="NIT">
                <Input />
              </Form.Item>
              <Form.Item name="telefono" label="Teléfono">
                <Input />
              </Form.Item>
              <Form.Item name="correo" label="Correo">
                <Input />
              </Form.Item>
              <Form.Item name="ciudad" label="Ciudad">
                <Input />
              </Form.Item>
              <Form.Item name="direccion" label="Dirección" className="md:col-span-2">
                <Input />
              </Form.Item>

              <Form.Item label="Color principal">
                <ColorPicker
                  value={colorPrincipal}
                  onChange={(color) => setColorPrincipal(color.toHexString())}
                  showText
                  className="w-full"
                />
              </Form.Item>
              <Form.Item label="Color secundario">
                <ColorPicker
                  value={colorSecundario}
                  onChange={(color) => setColorSecundario(color.toHexString())}
                  showText
                  className="w-full"
                />
              </Form.Item>
            </div>

            <Button type="primary" htmlType="button" loading={saving} onClick={handleSave}>
              Guardar
            </Button>
          </Form>
        </div>
      </Card>
    </div>
  )
}
