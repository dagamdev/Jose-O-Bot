import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { VerifyModel } from '../../models'
import { BUTTON_IDS } from '../../utils/constants'

const CheckScb = new SlashCommandBuilder()
  .setName('check')
  .setNameLocalization('es-ES', 'comprobar')
  .setDescription('Check command')
  .setDescriptionLocalization('es-ES', 'Comando comprobar')
  .addSubcommand(verifications => verifications
    .setName('verifications')
    .setNameLocalization('es-ES', 'verificaciones')
    .setDescription('Check the verifications of the members.')
    .setDescriptionLocalization('es-ES', 'Comprueba las verificaciones de los miembros.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()

export default class CheckSlashCommand extends ClientSlashCommand {
  constructor () {
    super(CheckScb,
      async (int, client) => {
        const { guild, options } = int

        if (guild === null) {
          int.reply({ ephemeral: true, content: 'Este comando solo se puede utilizar dentro de un servidor.' })
          return
        }

        const subcommandName = options.getSubcommand(true)

        if (subcommandName === 'verifications') {
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

          const verifiedMembers = guild.members.cache.filter(f => (!f.user.bot) && requiredGuild.members.cache.has(f.id) && !f.roles.cache.has(verifyData.rolId)).size
          const unverifiedMembers = guild.members.cache.filter(f => (!f.user.bot) && f.roles.cache.has(verifyData.rolId) && !requiredGuild.members.cache.has(f.id)).size

          if (verifiedMembers === 0 && unverifiedMembers === 0) {
            int.reply({ ephemeral: true, content: 'No hay miembros que deban estar verificados y no lo estén, ni miembros que estén verificados y no deban estarlo.' })
            return
          }

          const CheckVerificationsStatusEmbed = new EmbedBuilder({
            title: 'Comprobación de verificaciones',
            description: `${verifiedMembers !== 0
              ? `Se encontraron **${verifiedMembers}** miembros que están en el servidor requerido pero no tener el rol.\n`
              : ''}${unverifiedMembers !== 0 ? `Se encontraron **${unverifiedMembers}** miembros verificados que no se encuentran dentro del servidor requerido.\n` : ''}¿Qué acción quieres realizar?`
          }).setColor(client.data.colors.default)

          const CheckVerificationsComponents = new ActionRowBuilder<ButtonBuilder>({
            components: [
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_NONE,
                emoji: '👎',
                label: 'Ninguna',
                style: ButtonStyle.Danger
              })
            ]
          })

          if (verifiedMembers !== 0 && unverifiedMembers !== 0) {
            CheckVerificationsComponents.components.unshift(
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_REMOVE,
                emoji: '➖',
                label: 'Eliminar rol',
                style: ButtonStyle.Secondary
              }),
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_ADD,
                emoji: '➕',
                label: 'Agregar rol',
                style: ButtonStyle.Secondary
              }),
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_BOTH,
                emoji: '🪄',
                label: 'Ambas',
                style: ButtonStyle.Primary
              })
            )
          } else if (verifiedMembers !== 0) {
            CheckVerificationsComponents.components.unshift(
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_ADD,
                emoji: '➕',
                label: 'Agregar rol',
                style: ButtonStyle.Secondary
              })
            )
          } else {
            CheckVerificationsComponents.components.unshift(
              new ButtonBuilder({
                customId: BUTTON_IDS.CHECK_VERIFICATIONS_REMOVE,
                emoji: '➖',
                label: 'Eliminar rol',
                style: ButtonStyle.Secondary
              })
            )
          }

          int.reply({ ephemeral: true, embeds: [CheckVerificationsStatusEmbed], components: [CheckVerificationsComponents] })
        }
      }
    )
  }
}
