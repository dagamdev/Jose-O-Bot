"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const constants_1 = require("../../utils/constants");
class LoadSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(new discord_js_1.SlashCommandBuilder()
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
            .setRequired(true)))
            .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
            .toJSON(), async (int) => {
            const { guild, options } = int;
            if (guild === null) {
                int.reply({ ephemeral: true, content: 'Este comando solo se puede utilizar dentro de un servidor.' });
                return;
            }
            const subCommandName = int.options.getSubcommand(true);
            if (subCommandName === 'backup') {
                const backupId = options.getString('id', true);
                if (!(guild.members.me?.permissions.has('ManageRoles') ?? true)) {
                    int.reply({ ephemeral: true, content: 'No tengo permiso para gestionar roles en este servidor.' });
                    return;
                }
                if (!(guild.members.me?.permissions.has('ManageChannels') ?? true)) {
                    int.reply({ ephemeral: true, content: 'No tengo permiso para gestionar canales en este servidor.' });
                    return;
                }
                if (!(guild.members.me?.permissions.has('ManageWebhooks') ?? true)) {
                    int.reply({ ephemeral: true, content: 'No tengo permiso para gestionar webhooks en este servidor.' });
                    return;
                }
                const ConfirmationLoadBackupEmbed = new discord_js_1.EmbedBuilder({
                    title: '⚠️ ¿Estás seguro de que deseas cargar el respaldo?',
                    description: 'Se eliminarán todos los canales y roles actuales, siendo reemplazados por los del respaldo seleccionado.',
                    footer: {
                        text: `ID del respaldo: ${backupId}`
                    }
                }).setColor('Yellow');
                const ConfirmationLoadBackupButtons = new discord_js_1.ActionRowBuilder({
                    components: [
                        new discord_js_1.ButtonBuilder({
                            customId: constants_1.BUTTON_IDS.LOAD_BACKUP_CONFIRM,
                            emoji: '✅',
                            label: 'Confirmar',
                            style: discord_js_1.ButtonStyle.Success
                        }),
                        new discord_js_1.ButtonBuilder({
                            customId: constants_1.BUTTON_IDS.LOAD_BACKUP_CANCEL,
                            emoji: '❌',
                            label: 'Cancelar',
                            style: discord_js_1.ButtonStyle.Danger
                        })
                    ]
                });
                await int.reply({
                    ephemeral: true,
                    embeds: [ConfirmationLoadBackupEmbed],
                    components: [ConfirmationLoadBackupButtons]
                });
            }
        });
    }
}
exports.default = LoadSlashCommand;
