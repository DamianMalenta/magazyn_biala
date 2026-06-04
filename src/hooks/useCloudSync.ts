import { useContext } from 'react'
import { CloudSyncContext } from '../context/cloudSyncContext'

export function useCloudSync() {
  const ctx = useContext(CloudSyncContext)
  if (!ctx) throw new Error('useCloudSync must be used within CloudSyncProvider')
  return ctx
}
