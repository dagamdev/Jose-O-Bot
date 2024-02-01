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

          const unverifiedMembers = guild.members.cache.filter(f => f.roles.cache.has(verifyData.rolId) && !requiredGuild.members.cache.has(f.id)).size

          if (unverifiedMembers === 0) {
            int.reply({ ephemeral: true, content: 'No se encontraron miembros verificados que no estén dentro del servidor requerido.' })
            return
          }

          const CheckVerificationsStatusEmbed = new EmbedBuilder({
            title: 'Comprobación de verificaciones',
            description: `Se encontraron **${unverifiedMembers}** miembros verificados que no se encuentran dentro del servidor requerido.\n¿Quieres que elimine el rol de verificación de esos miembros?`
          }).setColor(client.data.colors.default)

          const CheckVerificationsComponents = new ActionRowBuilder<ButtonBuilder>({
            components: [
              new ButtonBuilder({
                customId: BUTTON_IDS.YES_CHECK_VERIFICATIONS,
                emoji: '👍',
                label: 'Si',
                style: ButtonStyle.Success
              }),
              new ButtonBuilder({
                customId: BUTTON_IDS.NO_CHECK_VERIFICATIONS,
                emoji: '👎',
                label: 'No',
                style: ButtonStyle.Danger
              })
            ]
          })

          int.reply({ ephemeral: true, embeds: [CheckVerificationsStatusEmbed], components: [CheckVerificationsComponents] })
        }
      }
    )
  }
}
