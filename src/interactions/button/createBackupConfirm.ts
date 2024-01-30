import { type PermissionOverwrites } from 'discord.js'
import { ClientButtonInteraction } from '../../client'
import { BackupModel, UserModel } from '../../models'
import { type Channel } from '../../models/backup'

export default class CreateBackupConfirm extends ClientButtonInteraction {
  constructor () {
    super('CREATE_BACKUP_CONFIRM',
      async (int, client) => {
        const { user, guild, guildId } = int

        if (guild === null) {
          int.update({ embeds: [], components: [], content: 'No estás dentro de un servidor.' })
          return
        }

        await int.update({ embeds: [], components: [], content: 'Creando respaldo...' })

        let userData = await UserModel.findOne({ userId: user.id })
        userData ??= await UserModel.create({
          userId: user.id
        })

        let icon

        if (guild.icon !== null) {
          const res = await fetch(guild.icon)
          if (res.status !== 200) return

          const arrayBuffer = await res.arrayBuffer()
          icon = Buffer.from(arrayBuffer)
        }

        const roles = await guild.roles.fetch()
        const channels = guild.channels.cache

        const mappedRoles = roles.filter(f => !f.managed).map((role) => {
          return {
            oldId: role.id,
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            rawPosition: role.rawPosition,
            mentionable: role.mentionable,
            permissions: role.permissions.bitfield,
            icon: role.icon,
            unicodeEmoji: role.unicodeEmoji
          }
        })

        const mappedChannels: Channel[] = []
        for (const data of channels.filter(f => f !== null)) {
          const channel = data[1]
          const ch: any = channel
          const messagesData = []

          if (!(userData.ignoreChannels.find(f => f.guildId === guildId)?.channelIDs.some(s => s === channel.id || s === channel.parentId) ?? true)) {
            if (channel.isTextBased()) {
              const messages = await channel.messages.fetch()

              for (const msgData of messages) {
                const msg = msgData[1]

                if (msg.content.length !== 0 || msg.attachments.size !== 0) {
                  const attachments = []

                  for (const atData of msg.attachments) {
                    const at = atData[1]
                    const res = await fetch(at.url)
                    if (res.status !== 200) continue

                    const arrayBuffer = await res.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)

                    attachments.push({
                      name: at.name,
                      data: buffer
                    })
                  }

                  messagesData.unshift({
                    author: {
                      id: msg.author.id,
                      name: msg.author.displayName,
                      avatar: msg.author.avatar
                    },
                    content: msg.content,
                    attachments
                  })
                }
              }
            }
          }

          mappedChannels.push({
            oldId: ch.id,
            name: ch.name,
            parentId: ch.parentId,
            position: ch.position,
            type: ch.type,
            nsfw: ch.nsfw,
            topic: ch.topic,
            rateLimitPerUser: ch.rateLimitPerUser,
            bitrate: ch.bitrate,
            rtcRegion: ch.rtcRegion,
            userLimit: ch.userLimit,
            videoQualityMode: ch.videoQualityMode,
            permissionOverwrites: ch.permissionOverwrites.cache.map((p: PermissionOverwrites) => ({
              id: p.id,
              type: p.type,
              deny: p.deny.bitfield,
              allow: p.allow.bitfield
            })),
            messages: messagesData
          })
        }

        const newBackup = await BackupModel.create({
          user: userData._id,
          guild: {
            id: guildId,
            name: guild.name,
            icon,
            description: guild.description
          },
          roles: mappedRoles,
          channels: mappedChannels
        })

        userData.backups.push(newBackup._id)
        await userData.save()

        const backupIDs = client.cache.backupIDs.find(f => f.userId === user.id)
        if (backupIDs === undefined) {
          client.cache.backupIDs.push({
            userId: user.id,
            IDs: [{
              value: newBackup.id,
              name: `${guild.name} | ${newBackup.createdAt.toLocaleDateString()} | ${newBackup.id}`
            }]
          })
        } else {
          backupIDs.IDs.push({
            value: newBackup.id,
            name: `${guild.name} | ${newBackup.createdAt.toLocaleDateString()} | ${newBackup.id}`
          })
        }

        await int.editReply({ content: `**Respaldo creado**\nID del respaldo: \`\`${newBackup.id}\`\`` })
      }
    )
  }
}
