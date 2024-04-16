import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js'
import { UserModel } from '../../models'
import { type Backup } from '../../models/backup'

const BackupScb = new SlashCommandBuilder()
  .setName('backup')
  .setNameLocalization('es-ES', 'respaldo')
  .setDescription('Backup command')
  .setDescriptionLocalization('es-ES', 'Comando de respaldo')
  .addSubcommand(list => list
    .setName('list')
    .setNameLocalization('es-ES', 'lista')
    .setDescription('List of your backups.')
    .setDescriptionLocalization('es-ES', 'Lista de tus respaldos.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()

export default class BackupSlashCommand extends ClientSlashCommand {
  constructor () {
    super(BackupScb,
      async (int, client) => {
        const { options } = int
        const subcommandName = options.getSubcommand(true)

        if (subcommandName === 'list') {
          const userData = await UserModel.findOne({ userId: int.user.id }).populate<{ backups: Backup[] }>('backups')

          if ((userData?.backups.length ?? 0) === 0) {
            int.reply({ ephemeral: true, content: 'No tienes respaldos creados.' })
            return
          }

          const BackupListEmbed = new EmbedBuilder({
            title: 'Tus respaldos creados',
            description: userData?.backups.map(b => `**${b.guild.name}** <t:${Math.floor(b.createdAt.valueOf() / 1000)}:R>\n\`\`\`${b.id}\`\`\``).join('\n\n').slice(0, 4000) ?? '*Sin respaldos*'
          }).setColor(client.data.colors.default)

          int.reply({ ephemeral: true, embeds: [BackupListEmbed] })
        }
      }
    )
  }
}
