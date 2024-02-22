import { EmbedBuilder } from 'discord.js'
import { ClientButtonInteraction } from '../../client'
import { VerifyModel } from '../../models'

export default class YesCheckVerifications extends ClientButtonInteraction {
  constructor () {
    super('CHECK_VERIFICATIONS_REMOVE',
      async (int, client) => {
        const { guild } = int

        if (guild === null) {
          int.reply({ ephemeral: true, content: 'No puede ejecutar está acción fuera de un servidor.' })
          return
        }

        const verifyData = await VerifyModel.findOne({ guildId: guild.id })

        if (verifyData === null) {
          int.reply({ ephemeral: true, content: 'El sistema de verificación no está establecido en este servidor o no se han podido cargar los datos.' })
          return
        }

        if (!(guild.members.me?.permissions.has('ManageRoles') ?? true)) {
          int.reply({ ephemeral: true, content: 'No tengo permiso para gestionar roles en este servidor.' })
          return
        }

        const requiredGuild = client.getGuild(verifyData.requiredGuildId)

        if (requiredGuild === undefined) {
          int.reply({ ephemeral: true, content: 'Necesito estar dentro del servidor requerido para que el sistema de verificación y sus comandos funcionen.' })
          return
        }

        const unverifiedMembers = guild.members.cache.filter(f => (!f.user.bot) && f.roles.cache.has(verifyData.rolId) && !requiredGuild.members.cache.has(f.id))

        if (unverifiedMembers.size === 0) {
          int.reply({ ephemeral: true, content: 'Al parecer ya no hay miembros verificados que no se encuentren dentro del servidor requerido.' })
          return
        }

        const StartEmbed = new EmbedBuilder({
          title: 'Ejecutando acción...',
          description: `Se está eliminando el rol de verificación de **${unverifiedMembers.size}** miembros que no se encuentran dentro del servidor requerido.`
        }).setColor(client.data.colors.default)

        await int.update({ embeds: [StartEmbed], components: [] })

        for (const unverified of unverifiedMembers) {
          const member = unverified[1]

          try {
            await member.roles.remove(verifyData.rolId)

            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(undefined)
              }, 1000)
            })
          } catch (error) {
            client.manageError('Error in check-verification-remove remove role iterator', error)
          }
        }

        const EndEmbed = new EmbedBuilder({
          title: 'Acción finalizada',
          description: `Se les ha eliminado el rol de verificación a **${unverifiedMembers.size}** miembros.`
        }).setColor('Green')

        await int.editReply({ embeds: [EndEmbed] })
      }
    )
  }
}
