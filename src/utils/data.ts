import { type ColorResolvable } from 'discord.js'

const colors: Record<'default', ColorResolvable> = {
  default: '#3254f9'
}

export const BOT_DATA = {
  id: '935927715159236638',
  colors
}

const backupIDs: Array<{
  userId: string
  IDs: Array<{
    value: string
    name: string
  }>
}> = []

const verifications: Array<{
  guildId: string
  addRole: string[]
  removeRole: string[]
}> = []

export const CACHE = {
  backupIDs,
  verifications
}
