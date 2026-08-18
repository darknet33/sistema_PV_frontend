import { useState } from 'react'
import { Select, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import SubCrudModal from './SubCrudModal'
import type { SubCrudModalProps } from './SubCrudModal'

interface SubCrudSelectProps {
  placeholder?: string
  value?: number | string | null
  onChange?: (value: number | string | null) => void
  options: { value: number | string; label: string }[]
  disabled?: boolean
  allowClear?: boolean
  modalProps: Omit<SubCrudModalProps, 'visible' | 'onCancel'>
}

export default function SubCrudSelect({
  placeholder,
  value,
  onChange,
  options,
  disabled,
  allowClear,
  modalProps,
}: SubCrudSelectProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Select
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={onChange}
        options={options}
        disabled={disabled}
        allowClear={allowClear ?? true}
        showSearch
        filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
        popupRender={(menu) => (
          <>
            {menu}
            <div className="p-2 border-t border-gray-100">
              <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                Gestionar {modalProps.title}
              </Button>
            </div>
          </>
        )}
      />
      <SubCrudModal
        {...modalProps}
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}
