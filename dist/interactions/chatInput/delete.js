"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const DeleteScb = new discord_js_1.SlashCommandBuilder()
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
    .setRequired(true)))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .toJSON();
class DeleteSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(DeleteScb, async (int) => {
            const { options } = int;
            const subcommandName = options.getSubcommand(true);
            if (subcommandName === 'backup') {
                const backupId = options.getString('id', true);
                const userData = await models_1.UserModel.findOne({ userId: int.user.id });
                if (userData === null || userData.backups.length === 0) {
                    int.reply({ ephemeral: true, content: 'Aún no tienes respaldos que eliminar.' });
                    return;
                }
                const backupData = await models_1.BackupModel.findOneAndDelete({ id: backupId });
                if (backupData === null) {
                    int.reply({ ephemeral: true, content: `No se encontró ningún respaldo con la ID proporcionada *(${backupId})*.` });
                    return;
                }
                userData?.backups.splice(userData?.backups.indexOf(backupData._id), 1);
                const DeleteBackupEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Respaldo eliminado',
                    description: `El respaldo del servidor **${backupData.guild.name}** con la ID \`\`${backupData.id}\`\` ha sido eliminado.`
                }).setColor('Green');
                await int.reply({ ephemeral: true, embeds: [DeleteBackupEmbed] });
            }
        });
    }
}
exports.default = DeleteSlashCommand;
