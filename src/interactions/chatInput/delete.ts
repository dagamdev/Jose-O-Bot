import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js'
import { BackupModel, UserModel } from '../../models'
import { removeBackupId } from '../../lib/backup'

const DeleteScb = new SlashCommandBuilder()
  .setName('delete')
  .setNameLocalization('es-ES', 'eliminar')
  .setDescription('Delete command')
  .setDescriptionLocalization('es-ES', 'Comando de eliminar')
  .addSubcommand(backup => backup
    .setName('backup')
    .setNameLocalization('es-ES', 'respaldo')
    .setDescription('Create server backup.')
    .setDescriptionLocalization('es-ES', 'Crear respaldo del servidor.')
    .addStringOption(backupId => backupId
      .setName('id')
      .setDescription('Backup ID.')
      .setDescriptionLocalization('es-ES', 'ID del respaldo.')
      .setAutocomplete(true)
      .setRequired(true)
    )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()

export default class DeleteSlashCommand extends ClientSlashCommand {
  constructor () {
    super(DeleteScb,
      async (int, client) => {
        const { options } = int
        const subcommandName = options.getSubcommand(true)

        if (subcommandName === 'backup') {
          const backupId = options.getString('id', true)

          const userData = await UserModel.findOne({ userId: int.user.id })

          if (userData === null || userData.backups.length === 0) {
            int.reply({ ephemeral: true, content: 'No tienes respaldos que eliminar.' })
            return
          }

          const backupData = await BackupModel.findOneAndDelete({ id: backupId })

          if (backupData === null) {
            int.reply({ ephemeral: true, content: `No se encontró ningún respaldo con la ID proporcionada *(${backupId})*.` })
            return
          }

          userData?.backups.splice(userData?.backups.indexOf(backupData._id), 1)
          await userData.save()

          removeBackupId(int.user.id, backupData.id as string)

          const DeleteBackupEmbed = new EmbedBuilder({
            title: 'Respaldo eliminado',
            description: `El respaldo del servidor **${backupData.guild.name}** con la ID \`\`${backupData.id}\`\` ha sido eliminado.`
          }).setColor('Green')

          await int.reply({ ephemeral: true, embeds: [DeleteBackupEmbed] })
        }
      }
    )
  }
}
