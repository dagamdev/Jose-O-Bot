import { EmbedBuilder } from 'discord.js'
import { ClientButtonInteraction } from '../../client'
import { VerifyModel } from '../../models'

export default class YesCheckVerifications extends ClientButtonInteraction {
  constructor () {
    super('CHECK_VERIFICATIONS_BOTH',
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
          title: 'Ejecutando acciones...',
          description: '🔘 Agregar el rol de verificación.\n🔘 Eliminar el rol de verificación.'
        }).setColor(client.data.colors.default)

        await int.update({ embeds: [StartEmbed], components: [] })

        let verifiedMembers = 0
        let unverifiedMembers = 0

        for (const m of await guild.members.fetch()) {
          const member = m[1]

          if (member.user.bot) continue

          const reqGuildMember = await client.userInGuild(requiredGuild, member.id)
          const containRole = member.roles.cache.has(verifyData.rolId)

          try {
            if (reqGuildMember && !containRole) {
              verifiedMembers++
              await member.roles.add(verifyData.rolId)
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(undefined)
                }, 1000)
              })
            }
            if (containRole && !reqGuildMember) {
              unverifiedMembers++
              await member.roles.remove(verifyData.rolId)

              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(undefined)
                }, 1000)
              })
            }
          } catch (error) {
            client.manageError('Error in check-verification-both iterator', error)
          }
        }

        if (verifiedMembers === 0 && unverifiedMembers === 0) {
          int.update({ content: 'Parece que los datos han cambiado. No hay miembros sin el rol de verificación que cumplan los requisitos, ni miembros con el rol que no estén en el servidor requerido.', embeds: [] })
          return
        }

        const EndEmbed = new EmbedBuilder({
          title: 'Acciónes finalizadas',
          description: `✅ Agregar el rol de verificación a **${verifiedMembers}** miembros.\n✅ Eliminar el rol de verificación de **${unverifiedMembers}** miembros.`
        }).setColor('Green')

        await int.editReply({ embeds: [EndEmbed] })
      }
    )
  }
}
