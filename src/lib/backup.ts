import { CACHE } from '../utils/data'

export function addBackupId (userId: string, backupId: string, name: string) {
  const backupIDs = CACHE.backupIDs.find(f => f.userId === userId)

  if (backupIDs === undefined) {
    CACHE.backupIDs.push({
      userId,
      IDs: [{
        value: backupId,
        name
      }]
    })
  } else {
    backupIDs.IDs.push({
      value: backupId,
      name
    })
  }
}

export function removeBackupId (userId: string, backupId: string) {
  const backupIDs = CACHE.backupIDs.find(f => f.userId === userId)

  if (backupIDs === undefined) return

  backupIDs.IDs.splice(backupIDs.IDs.findIndex(id => id.value === backupId), 1)
}
