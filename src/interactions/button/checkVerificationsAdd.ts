import { EmbedBuilder } from 'discord.js'
import { ClientButtonInteraction } from '../../client'
import { VerifyModel } from '../../models'
import { handleVerifiedRole, resetVerifiedRoleData } from '../../lib'

export default class YesCheckVerifications extends ClientButtonInteraction {
  constructor () {
    super('CHECK_VERIFICATIONS_ADD',
      async (int, client) => {
        const { guild } = int

        if (guild === null) {
          int.update({ content: 'No puede ejecutar está acción fuera de un servidor.', embeds: [], components: [] })
          return
        }

        const verifyData = await VerifyModel.findOne({ guildId: guild.id })

        if (verifyData === null) {
          int.update({ content: 'El sistema de verificación no está establecido en este servidor o no se han podido cargar los datos.', embeds: [], components: [] })
          return
        }

        if (!(guild.members.me?.permissions.has('ManageRoles') ?? true)) {
          int.update({ content: 'No tengo permiso para gestionar roles en este servidor.', embeds: [], components: [] })
          return
        }

        const requiredGuild = client.getGuild(verifyData.requiredGuildId)

        if (requiredGuild === undefined) {
          int.update({ content: 'Necesito estar dentro del servidor requerido para que el sistema de verificación y sus comandos funcionen.', embeds: [], components: [] })
          return
        }

        const StartEmbed = new EmbedBuilder({
          title: 'Ejecutando acción...',
          description: '🔘 Agregar el rol de verificación a miembros.'
        }).setColor(client.data.colors.default)

        await int.update({ embeds: [StartEmbed], components: [] })

        const verifiedMembers = await handleVerifiedRole(guild, verifyData.rolId, 'ADD')
        resetVerifiedRoleData(guild.id)

        if (verifiedMembers === 0) {
          int.editReply({ content: 'Parece que no hay miembros en el servidor requerido que no tengan el rol de verificación.', embeds: [] })
          return
        }

        const EndEmbed = new EmbedBuilder({
          title: 'Acción finalizada',
          description: `✅ Agregar el rol de verificación a **${verifiedMembers}** miembros.`
        }).setColor('Green')

        await int.editReply({ embeds: [EndEmbed] })
      }
    )
  }
}
