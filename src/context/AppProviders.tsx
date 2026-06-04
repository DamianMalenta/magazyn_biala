import type { ReactNode } from 'react'
import { ConfigProvider } from './ConfigProvider'
import { InventoryProvider } from './InventoryProvider'
import { useConfig } from '../hooks/useConfig'

function InventoryWithConfigSync({ children }: { children: ReactNode }) {
  const { renameSkuAliases } = useConfig()
  return <InventoryProvider onSkuRenamed={renameSkuAliases}>{children}</InventoryProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <InventoryWithConfigSync>{children}</InventoryWithConfigSync>
    </ConfigProvider>
  )
}
