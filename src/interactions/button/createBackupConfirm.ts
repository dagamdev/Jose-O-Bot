import { ClientButtonInteraction } from '../../client'
import { BackupModel, UserModel } from '../../models'

export default class CreateBackupConfirm extends ClientButtonInteraction {
  constructor () {
    super('CREATE_BACKUP_CONFIRM',
      async (int, client) => {
        const { user, guild, guildId } = int

        if (guild === null) {
          int.update({ embeds: [], components: [], content: 'No estás dentro de un servidor.' })
          return
        }

        await int.reply({ ephemeral: true, content: 'Creando respaldo...' })

        let userData = await UserModel.findOne({ userId: user.id })
        userData ??= await UserModel.create({
          userId: user.id
        })

        const roles = await guild.roles.fetch()
        const channels = await guild.channels.fetch()

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

        const mappedChannels: Array<{
          oldId: string
          name: string
          parentId: string
          position: number
          type: number
          nsfw: boolean | null
          topic: string | null
          rateLimitPerUser: number | null
          bitrate: number | null
          rtcRegion: string | null
          userLimit: number | null
          videoQualityMode: number | null
        }> = []
        channels.filter(f => f !== null).forEach((ch: any) => {
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
            videoQualityMode: ch.videoQualityMode
          })
        })

        const newBackup = await BackupModel.create({
          user: userData._id,
          guild: {
            id: guildId,
            name: guild.name,
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
        // await int.update({ embeds: [], components: [], content: 'Creando respaldo del servidor...' })
      }
    )
  }
}
