"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const IgnoreScb = new discord_js_1.SlashCommandBuilder()
    .setName('ignore')
    .setNameLocalization('es-ES', 'ignorar')
    .setDescription('Ignore main command')
    .setDescriptionLocalization('es-ES', 'Comando principal de ignorar')
    .addSubcommand(list => list
    .setName('list')
    .setNameLocalization('es-ES', 'lista')
    .setDescription('List of ignored channels.')
    .setDescriptionLocalization('es-ES', 'Lista de canales ignorados.'))
    .addSubcommand(add => add
    .setName('add')
    .setNameLocalization('es-ES', 'agregar')
    .setDescription('Add a new channel to the ignore list.')
    .setDescriptionLocalization('es-ES', 'Agrega un nuevo canal a la lista de ignorados.'))
    .addSubcommand(remove => remove
    .setName('remove')
    .setNameLocalization('es-ES', 'eliminar')
    .setDescription('Remove a channel from the ignore list.')
    .setDescriptionLocalization('es-ES', 'Eliminar un canal de la lista de ignorados.'))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .toJSON();
class BackupSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(IgnoreScb, async (int, client) => {
        });
    }
}
exports.default = BackupSlashCommand;
