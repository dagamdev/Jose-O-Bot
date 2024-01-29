import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { BUTTON_IDS } from '../../utils/constants'

export default class LoadSlashCommand extends ClientSlashCommand {
  constructor () {
    super(new SlashCommandBuilder()
      .setName('load')
      .setNameLocalization('es-ES', 'cargar')
      .setDescription('Load command')
      .setDescriptionLocalization('es-ES', 'Comando de cargar')
      .addSubcommand(backup => backup
        .setName('backup')
        .setNameLocalization('es-ES', 'respaldo')
        .setDescription('Load server backup.')
        .setDescriptionLocalization('es-ES', 'Cargar respaldo del servidor.')
        .addStringOption(backupId => backupId
          .setName('id')
          .setDescription('Backup ID.')
          .setDescriptionLocalization('es-ES', 'ID del respaldo.')
          .setAutocomplete(true)
          .setRequired(true)
        )
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .toJSON(),
    async (int) => {
      const { options } = int
      const subCommandName = int.options.getSubcommand(true)

      if (subCommandName === 'backup') {
        const backupId = options.getString('id', true)

        const ConfirmationLoadBackupEmbed = new EmbedBuilder({
          title: '⚠️ ¿Estás seguro de que deseas cargar el respaldo?',
          description: 'Se eliminarán todos los canales y roles actuales, siendo reemplazados por los del respaldo seleccionado.',
          footer: {
            text: `ID del respaldo: ${backupId}`
          }
        }).setColor('Yellow')

        const ConfirmationLoadBackupButtons = new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              customId: BUTTON_IDS.LOAD_BACKUP_CONFIRM,
              emoji: '✅',
              label: 'Confirmar',
              style: ButtonStyle.Success
            }),
            new ButtonBuilder({
              customId: BUTTON_IDS.LOAD_BACKUP_CANCEL,
              emoji: '❌',
              label: 'Cancelar',
              style: ButtonStyle.Danger
            })
          ]
        })

        await int.reply({
          ephemeral: true,
          embeds: [ConfirmationLoadBackupEmbed],
          components: [ConfirmationLoadBackupButtons]
        })
      }
    })
  }
}
