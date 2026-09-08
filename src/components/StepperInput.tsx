import { Button, InputNumber, Space } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

interface StepperInputProps {
  value?: number | null
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
}

export default function StepperInput({ value, onChange, min = 1, max, step = 1, size, disabled }: StepperInputProps) {
  const current = Number(value || 0)
  const prevDisabled = disabled || current <= min
  const nextDisabled = disabled || (max != null && current >= max)

  const change = (next: number) => {
    if (max != null) next = Math.min(max, next)
    onChange?.(Math.max(min, next))
  }

  return (
    <Space.Compact>
      <Button icon={<MinusOutlined />} size={size} disabled={prevDisabled} onClick={() => change(current - step)} />
      <InputNumber
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        size={size}
        disabled={disabled}
        controls={false}
        style={{ width: 64, textAlign: 'center' }}
      />
      <Button icon={<PlusOutlined />} size={size} disabled={nextDisabled} onClick={() => change(current + step)} />
    </Space.Compact>
  )
}