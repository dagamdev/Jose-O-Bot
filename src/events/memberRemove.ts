import { ClientEvent, type BotClient } from '../client'
import { EmbedBuilder, type GuildMember, type PartialGuildMember } from 'discord.js'
import { VerifyModel } from '../models'

export default class MemberRemoveEvent extends ClientEvent {
  constructor () {
    super('guildMemberRemove')
  }

  public async execute (member: GuildMember | PartialGuildMember, client: BotClient) {
    const { guild } = member

    const verifyData = await VerifyModel.findOne({ requiredGuildId: guild.id })

    if (verifyData !== null) {
      const verifyGuild = client.getGuild(verifyData.guildId)

      if (verifyGuild !== undefined) {
        const verifyMember = verifyGuild.members.cache.get(member.id)
        if (verifyMember !== undefined && verifyMember.roles.cache.has(verifyData.rolId)) {
          verifyMember.roles.remove(verifyData.rolId).then(() => {
            const MemberRemoveRoleEmbed = new EmbedBuilder({
              title: `⚠️ Te he retirado el rol de verificación en el servidor ${verifyGuild.name}.`,
              description: `Al salir del servidor requerido para la verificación, te he eliminado el rol de verificación dentro de **${verifyGuild.name}**.`,
              footer: {
                text: 'Es obligatorio permanecer en el servidor requerido para la verificación.'
              }
            }).setColor('Yellow')

            member.send({ embeds: [MemberRemoveRoleEmbed] })
          }).catch((e) => {
            client.manageError('El rol no se pudo eliminar del miembro: ', e)
          })
        }
      }
    }
  }
}
