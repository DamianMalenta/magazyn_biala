import type { ReactNode } from 'react'
import { ConfigProvider } from './ConfigProvider'
import { InventoryProvider } from './InventoryProvider'
import { CloudSyncProvider } from './CloudSyncProvider'
import { useConfig } from '../hooks/useConfig'

function InventoryWithConfigSync({ children }: { children: ReactNode }) {
  const { renameSkuAliases } = useConfig()
  return <InventoryProvider onSkuRenamed={renameSkuAliases}>{children}</InventoryProvider>
}

function CloudSyncLayer({ children }: { children: ReactNode }) {
  return <CloudSyncProvider>{children}</CloudSyncProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <InventoryWithConfigSync>
        <CloudSyncLayer>{children}</CloudSyncLayer>
      </InventoryWithConfigSync>
    </ConfigProvider>
  )
}
