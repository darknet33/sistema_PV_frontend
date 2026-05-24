import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Select, Grid } from 'antd'
import type { MenuProps } from 'antd'

const { Sider, Content } = Layout
const { useBreakpoint } = Grid

interface SideNavItem {
  key: string
  icon: React.ReactNode
  label: string
}

interface SideNavProps {
  items: SideNavItem[]
  children: React.ReactNode
}

export default function SideNav({ items, children }: SideNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const selectedKey = items.find((item) => location.pathname === item.key)?.key || items[0]?.key || ''

  const selectOptions = items.map((item) => ({ value: item.key, label: item.label }))

  return (
    <Layout className="min-h-full bg-transparent">
      {isMobile ? (
        <div className="mb-4">
          <Select
            value={selectedKey}
            onChange={(key) => navigate(key)}
            options={selectOptions}
            className="w-full"
          />
        </div>
      ) : (
        <Sider width={200} theme="light" className="bg-white pr-2">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items as MenuProps['items']}
            onClick={({ key }) => navigate(key)}
            className="border-r-0"
          />
        </Sider>
      )}
      <Content className={isMobile ? 'p-0' : 'px-4'}>
        {children}
      </Content>
    </Layout>
  )
}
