"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const constants_1 = require("../../utils/constants");
class CreateSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(new discord_js_1.SlashCommandBuilder()
            .setName('create')
            .setNameLocalization('es-ES', 'crear')
            .setDescription('Create command')
            .setDescriptionLocalization('es-ES', 'Comando de crear')
            .addSubcommand(backup => backup
            .setName('backup')
            .setNameLocalization('es-ES', 'respaldo')
            .setDescription('Create server backup.')
            .setDescriptionLocalization('es-ES', 'Crear respaldo del servidor.'))
            .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
            .toJSON(), async (int, client) => {
            const subCommandName = int.options.getSubcommand(true);
            if (subCommandName === 'backup') {
                const ConfirmationBackupEmbed = new discord_js_1.EmbedBuilder({
                    title: '⚠️ ¿Estás seguro de que deseas hacer un respaldo del servidor?',
                    description: 'El proceso tomará un tiempo dependiendo de la cantidad de canales y roles que tenga el servidor.'
                }).setColor('Yellow');
                const ConfirmationBackupButtons = new discord_js_1.ActionRowBuilder({
                    components: [
                        new discord_js_1.ButtonBuilder({
                            customId: constants_1.BUTTON_IDS.CREATE_BACKUP_CONFIRM,
                            emoji: '✅',
                            label: 'Confirmar',
                            style: discord_js_1.ButtonStyle.Success
                        }),
                        new discord_js_1.ButtonBuilder({
                            customId: constants_1.BUTTON_IDS.CREATE_BACKUP_CANCEL,
                            emoji: '❌',
                            label: 'Cancelar',
                            style: discord_js_1.ButtonStyle.Danger
                        })
                    ]
                });
                int.reply({ ephemeral: true, embeds: [ConfirmationBackupEmbed], components: [ConfirmationBackupButtons] });
            }
        });
    }
}
exports.default = CreateSlashCommand;
