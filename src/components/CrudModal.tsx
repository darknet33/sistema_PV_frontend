import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd'

export interface CrudField {
  name: string
  label: string
  type?: 'text' | 'number' | 'switch' | 'select' | 'textarea' | 'password'
  required?: boolean
  rules?: Record<string, unknown>[]
  placeholder?: string
  options?: { value: string | number; label: string }[]
  min?: number
  max?: number
  step?: number
  props?: Record<string, unknown>
}

interface CrudModalProps {
  visible: boolean
  onCancel: () => void
  onSubmit: () => void
  form: ReturnType<typeof Form.useForm>[0]
  title: string
  fields: CrudField[]
  loading?: boolean
  editing?: boolean
  width?: number
}

export default function CrudModal({
  visible,
  onCancel,
  onSubmit,
  form,
  title,
  fields,
  loading,
  width,
}: CrudModalProps) {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={loading}
      destroyOnClose
      width={width ?? 480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {fields.map((field) => {
          const baseRules = field.required
            ? [...(field.rules ?? []), { required: true, message: `${field.label} es requerido` }]
            : field.rules

          switch (field.type) {
            case 'switch':
              return (
                <Form.Item key={field.name} name={field.name} label={field.label} valuePropName="checked">
                  <Switch {...field.props} />
                </Form.Item>
              )
            case 'select':
              return (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={baseRules}
                >
                  <Select
                    placeholder={field.placeholder ?? `Seleccione ${field.label.toLowerCase()}`}
                    options={field.options}
                    allowClear
                    {...field.props}
                  />
                </Form.Item>
              )
            case 'number':
              return (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={baseRules}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={field.placeholder ?? field.label}
                    min={field.min ?? 0}
                    max={field.max}
                    step={field.step}
                    {...field.props}
                  />
                </Form.Item>
              )
              case 'password':
                return (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={baseRules}
                  >
                    <Input.Password
                      placeholder={field.placeholder ?? field.label}
                      {...field.props}
                    />
                  </Form.Item>
                )
              case 'textarea':
                return (
                  <Form.Item
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    rules={baseRules}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder={field.placeholder ?? field.label}
                      {...field.props}
                    />
                  </Form.Item>
                )
              default:
              return (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={baseRules}
                >
                  <Input placeholder={field.placeholder ?? field.label} {...field.props} />
                </Form.Item>
              )
          }
        })}
      </Form>
    </Modal>
  )
}

export { Form }
