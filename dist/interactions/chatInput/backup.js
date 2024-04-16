"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const BackupScb = new discord_js_1.SlashCommandBuilder()
    .setName('backup')
    .setNameLocalization('es-ES', 'respaldo')
    .setDescription('Backup command')
    .setDescriptionLocalization('es-ES', 'Comando de respaldo')
    .addSubcommand(list => list
    .setName('list')
    .setNameLocalization('es-ES', 'lista')
    .setDescription('List of your backups.')
    .setDescriptionLocalization('es-ES', 'Lista de tus respaldos.'))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .toJSON();
class BackupSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(BackupScb, async (int, client) => {
            const { options } = int;
            const subcommandName = options.getSubcommand(true);
            if (subcommandName === 'list') {
                const userData = await models_1.UserModel.findOne({ userId: int.user.id }).populate('backups');
                if ((userData?.backups.length ?? 0) === 0) {
                    int.reply({ ephemeral: true, content: 'No tienes respaldos creados.' });
                    return;
                }
                const BackupListEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Tus respaldos creados',
                    description: userData?.backups.map(b => `**${b.guild.name}** <t:${Math.floor(b.createdAt.valueOf() / 1000)}:R>\n\`\`\`${b.id}\`\`\``).join('\n\n').slice(0, 4000) ?? '*Sin respaldos*'
                }).setColor(client.data.colors.default);
                int.reply({ ephemeral: true, embeds: [BackupListEmbed] });
            }
        });
    }
}
exports.default = BackupSlashCommand;
