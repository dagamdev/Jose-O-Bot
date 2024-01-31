import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { BUTTON_IDS } from '../../utils/constants'

export default class CreateSlashCommand extends ClientSlashCommand {
  constructor () {
    super(
      new SlashCommandBuilder()
        .setName('create')
        .setNameLocalization('es-ES', 'crear')
        .setDescription('Create command')
        .setDescriptionLocalization('es-ES', 'Comando de crear')
        .addSubcommand(backup => backup
          .setName('backup')
          .setNameLocalization('es-ES', 'respaldo')
          .setDescription('Create server backup.')
          .setDescriptionLocalization('es-ES', 'Crear respaldo del servidor.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
      async (int) => {
        const { guild } = int

        if (guild === null) {
          int.reply({ ephemeral: true, content: 'Este comando solo se puede utilizar dentro de un servidor.' })
          return
        }

        const subCommandName = int.options.getSubcommand(true)

        if (subCommandName === 'backup') {
          const ConfirmationBackupEmbed = new EmbedBuilder({
            title: '⚠️ ¿Estás seguro de que deseas hacer un respaldo del servidor?',
            description: 'El proceso tomará un tiempo dependiendo de la cantidad de canales y roles que tenga el servidor.'
          }).setColor('Yellow')

          const ConfirmationBackupButtons = new ActionRowBuilder<ButtonBuilder>({
            components: [
              new ButtonBuilder({
                customId: BUTTON_IDS.CREATE_BACKUP_CONFIRM,
                emoji: '✅',
                label: 'Confirmar',
                style: ButtonStyle.Success
              }),
              new ButtonBuilder({
                customId: BUTTON_IDS.CREATE_BACKUP_CANCEL,
                emoji: '❌',
                label: 'Cancelar',
                style: ButtonStyle.Danger
              })
            ]
          })

          int.reply({ ephemeral: true, embeds: [ConfirmationBackupEmbed], components: [ConfirmationBackupButtons] })
        }
      }
    )
  }
}
