"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const constants_1 = require("../../utils/constants");
const lib_1 = require("../../lib");
const CheckScb = new discord_js_1.SlashCommandBuilder()
    .setName('check')
    .setNameLocalization('es-ES', 'comprobar')
    .setDescription('Check command')
    .setDescriptionLocalization('es-ES', 'Comando comprobar')
    .addSubcommand(verifications => verifications
    .setName('verifications')
    .setNameLocalization('es-ES', 'verificaciones')
    .setDescription('Check the verifications of the members.')
    .setDescriptionLocalization('es-ES', 'Comprueba las verificaciones de los miembros.'))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .toJSON();
class CheckSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(CheckScb, async (int, client) => {
            const { guild, options } = int;
            if (guild === null) {
                int.reply({ ephemeral: true, content: 'Este comando solo se puede utilizar dentro de un servidor.' });
                return;
            }
            const subcommandName = options.getSubcommand(true);
            if (subcommandName.toLowerCase().includes('verif')) {
                await int.reply({ ephemeral: true, content: 'El sistema de verificación está desactivado.' });
                return;
            }
            if (subcommandName === 'verifications') {
                const verifyData = await models_1.VerifyModel.findOne({ guildId: guild.id });
                if (verifyData === null) {
                    int.reply({ ephemeral: true, content: 'El sistema de verificación no está establecido en este servidor o no se han podido cargar los datos.' });
                    return;
                }
                if (!(guild.members.me?.permissions.has('ManageRoles') ?? true)) {
                    int.reply({ ephemeral: true, content: 'No tengo permiso para gestionar roles en este servidor.' });
                    return;
                }
                const requiredGuild = client.getGuild(verifyData.requiredGuildId);
                if (requiredGuild === undefined) {
                    int.reply({ ephemeral: true, content: 'Necesito estar dentro del servidor requerido para que el sistema de verificación y sus comandos funcionen.' });
                    return;
                }
                const StartEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Inspeccionando usuarios...'
                }).setColor(client.data.colors.default);
                const startMessage = await int.reply({ embeds: [StartEmbed], fetchReply: true });
                let verifiedMembers = 0;
                let unverifiedMembers = 0;
                for (const m of await guild.members.fetch()) {
                    const member = m[1];
                    if (member.user.bot)
                        continue;
                    const reqGuildMember = await client.userInGuild(requiredGuild, member.id);
                    const containRole = member.roles.cache.has(verifyData.rolId);
                    if (reqGuildMember && !containRole) {
                        verifiedMembers++;
                        (0, lib_1.addIdToVerification)(guild.id, member.id, 'ADD');
                    }
                    if (containRole && !reqGuildMember) {
                        unverifiedMembers++;
                        (0, lib_1.addIdToVerification)(guild.id, member.id, 'REMOVE');
                    }
                }
                if (verifiedMembers === 0 && unverifiedMembers === 0) {
                    await startMessage.edit({ content: 'No hay miembros que deban estar verificados y no lo estén, ni miembros que estén verificados y no deban estarlo.', embeds: [] });
                    return;
                }
                const CheckVerificationsStatusEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Comprobación de verificaciones',
                    description: `${verifiedMembers !== 0
                        ? `Se encontraron **${verifiedMembers}** miembros que están en el servidor requerido pero no tienen el rol.\n`
                        : ''}${unverifiedMembers !== 0 ? `Se encontraron **${unverifiedMembers}** miembros verificados que no se encuentran dentro del servidor requerido.\n` : ''}\n¿Qué acción quieres realizar?`
                }).setColor(client.data.colors.default);
                const CheckVerificationsComponents = new discord_js_1.ActionRowBuilder({
                    components: [
                        new discord_js_1.ButtonBuilder({
                            customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_NONE,
                            emoji: '👎',
                            label: 'Ninguna',
                            style: discord_js_1.ButtonStyle.Danger
                        })
                    ]
                });
                if (verifiedMembers !== 0 && unverifiedMembers !== 0) {
                    CheckVerificationsComponents.components.unshift(new discord_js_1.ButtonBuilder({
                        customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_REMOVE,
                        emoji: '➖',
                        label: 'Eliminar rol',
                        style: discord_js_1.ButtonStyle.Secondary
                    }), new discord_js_1.ButtonBuilder({
                        customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_ADD,
                        emoji: '➕',
                        label: 'Agregar rol',
                        style: discord_js_1.ButtonStyle.Secondary
                    }), new discord_js_1.ButtonBuilder({
                        customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_BOTH,
                        emoji: '🪄',
                        label: 'Ambas',
                        style: discord_js_1.ButtonStyle.Primary
                    }));
                }
                else if (verifiedMembers !== 0) {
                    CheckVerificationsComponents.components.unshift(new discord_js_1.ButtonBuilder({
                        customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_ADD,
                        emoji: '➕',
                        label: 'Agregar rol',
                        style: discord_js_1.ButtonStyle.Secondary
                    }));
                }
                else {
                    CheckVerificationsComponents.components.unshift(new discord_js_1.ButtonBuilder({
                        customId: constants_1.BUTTON_IDS.CHECK_VERIFICATIONS_REMOVE,
                        emoji: '➖',
                        label: 'Eliminar rol',
                        style: discord_js_1.ButtonStyle.Secondary
                    }));
                }
                await startMessage.edit({ embeds: [CheckVerificationsStatusEmbed], components: [CheckVerificationsComponents] });
            }
        });
    }
}
exports.default = CheckSlashCommand;
