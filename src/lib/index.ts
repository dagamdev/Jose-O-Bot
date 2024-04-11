import { type Guild } from 'discord.js'
import { CACHE } from '../utils/data'

export function generateCode (length = 6) {
  if (typeof length !== 'number') length = 6
  let res = ''

  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 22).toString(22)
  }

  return res
}

export function addIdToVerification (guildId: string, memberId: string, type: 'ADD' | 'REMOVE') {
  let verificationData = CACHE.verifications.find(v => v.guildId === guildId)
  const existData = verificationData !== undefined

  if (verificationData === undefined) {
    verificationData = {
      guildId,
      addRole: [],
      removeRole: []
    }
  }

  const roleType = type === 'ADD' ? 'addRole' : 'removeRole'
  const exist = verificationData[roleType].includes(memberId)

  if (!exist) {
    verificationData[roleType].push(memberId)
  }

  if (!existData) {
    CACHE.verifications.push(verificationData)
  }
}

export async function handleVerifiedRole (guild: Guild, rolId: string, type: 'ADD' | 'REMOVE') {
  const verificationData = CACHE.verifications.find(v => v.guildId === guild.id)

  if (verificationData === undefined) return

  const roleType = type === 'ADD' ? 'addRole' : 'removeRole'
  const memberIDs = verificationData[roleType]
  let counter = 0

  for (const memberId of memberIDs) {
    const member = guild.members.cache.get(memberId)

    if (member === undefined) continue

    try {
      await member.roles[type === 'ADD' ? 'add' : 'remove'](rolId)
    } catch (error) {
      console.error(error)
    }
    counter++
    verificationData[roleType] = verificationData[roleType].filter(mi => mi === memberId)
  }

  return counter
}

export function resetVerifiedRoleData (guildId: string) {
  CACHE.verifications.splice(CACHE.verifications.findIndex(v => v.guildId === guildId), 1)
}
