import { ClientSlashCommand } from '../../client'
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'

const IgnoreScb = new SlashCommandBuilder()
  .setName('ignore')
  .setNameLocalization('es-ES', 'ignorar')
  .setDescription('Ignore main command')
  .setDescriptionLocalization('es-ES', 'Comando principal de ignorar')
  .addSubcommand(list => list
    .setName('list')
    .setNameLocalization('es-ES', 'lista')
    .setDescription('List of ignored channels.')
    .setDescriptionLocalization('es-ES', 'Lista de canales ignorados.')
  )
  .addSubcommand(add => add
    .setName('add')
    .setNameLocalization('es-ES', 'agregar')
    .setDescription('Add a new channel to the ignore list.')
    .setDescriptionLocalization('es-ES', 'Agrega un nuevo canal a la lista de ignorados.')
  )
  .addSubcommand(remove => remove
    .setName('remove')
    .setNameLocalization('es-ES', 'eliminar')
    .setDescription('Remove a channel from the ignore list.')
    .setDescriptionLocalization('es-ES', 'Eliminar un canal de la lista de ignorados.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()

export default class BackupSlashCommand extends ClientSlashCommand {
  constructor () {
    super(IgnoreScb,
      async (int, client) => {

      }
    )
  }
}
