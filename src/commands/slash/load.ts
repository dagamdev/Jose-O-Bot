import { type BotClient, ClientSlashCommand, type SlashInteraction } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

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
      .toJSON())
  }

  public async execute (int: SlashInteraction, client: BotClient) {
    const { options } = int
    const subCommandName = int.options.getSubcommand(true)

    if (subCommandName === 'backup') {
      const backupId = options.getString('id', true)

      int.reply({ ephemeral: true, content: `El ID del backup es ${backupId}` })
    }
  }
}
