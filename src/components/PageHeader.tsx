import type { ReactNode } from 'react'
import { Typography } from 'antd'

const { Title } = Typography

interface PageHeaderProps {
  title: string
  children?: ReactNode
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
      <Title level={4} className="!m-0">{title}</Title>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
