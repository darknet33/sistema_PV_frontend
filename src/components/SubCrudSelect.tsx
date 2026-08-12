import { useState } from 'react'
import { Select, Button, Space } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import SubCrudModal from './SubCrudModal'
import type { SubCrudModalProps } from './SubCrudModal'

interface SubCrudSelectProps {
  placeholder: string
  value?: number | null
  onChange?: (value: number | null) => void
  options: { value: number; label: string }[]
  modalProps: Omit<SubCrudModalProps, 'visible' | 'onCancel'>
}

export default function SubCrudSelect({ placeholder, value, onChange, options, modalProps }: SubCrudSelectProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Select
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={onChange}
        options={options}
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ flex: 1 }}
      />
      <Button icon={<SettingOutlined />} onClick={() => setModalOpen(true)} />
      <SubCrudModal
        {...modalProps}
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
      />
    </Space.Compact>
  )
}
