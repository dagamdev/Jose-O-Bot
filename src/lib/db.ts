import { UserModel } from '../models'
import { CACHE } from '../utils/data'
import { type Backup } from '../models/backup'

export function databaseConnectionReady () {
  UserModel.find().populate<{ backups: Backup[] }>('backups').then(users => {
    users.forEach(user => {
      CACHE.backupIDs.push({
        userId: user.userId,
        IDs: user.backups.map((backup) => {
          return {
            value: backup.id,
            name: `${backup.guild.name} | ${backup.createdAt.toLocaleDateString()} | ${backup.id}`
          }
        })
      })
    })
  })
}
