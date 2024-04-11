"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("../../client");
const models_1 = require("../../models");
const lib_1 = require("../../lib");
class YesCheckVerifications extends client_1.ClientButtonInteraction {
    constructor() {
        super('CHECK_VERIFICATIONS_REMOVE', async (int, client) => {
            const { guild } = int;
            if (guild === null) {
                int.update({ content: 'No puede ejecutar está acción fuera de un servidor.', embeds: [], components: [] });
                return;
            }
            const verifyData = await models_1.VerifyModel.findOne({ guildId: guild.id });
            if (verifyData === null) {
                int.update({ content: 'El sistema de verificación no está establecido en este servidor o no se han podido cargar los datos.', embeds: [], components: [] });
                return;
            }
            if (!(guild.members.me?.permissions.has('ManageRoles') ?? true)) {
                int.update({ content: 'No tengo permiso para gestionar roles en este servidor.', embeds: [], components: [] });
                return;
            }
            const requiredGuild = client.getGuild(verifyData.requiredGuildId);
            if (requiredGuild === undefined) {
                int.update({ content: 'Necesito estar dentro del servidor requerido para que el sistema de verificación y sus comandos funcionen.', embeds: [], components: [] });
                return;
            }
            const StartEmbed = new discord_js_1.EmbedBuilder({
                title: 'Ejecutando acción...',
                description: '🔘 Eliminar el rol de verificación de miembros.'
            }).setColor(client.data.colors.default);
            await int.update({ embeds: [StartEmbed], components: [] });
            const unverifiedMembers = await (0, lib_1.handleVerifiedRole)(guild, verifyData.rolId, 'REMOVE');
            (0, lib_1.resetVerifiedRoleData)(guild.id);
            if (unverifiedMembers === 0) {
                int.editReply({ content: 'Al parecer ya no hay miembros verificados que no se encuentren dentro del servidor requerido.', embeds: [] });
                return;
            }
            const EndEmbed = new discord_js_1.EmbedBuilder({
                title: 'Acción finalizada',
                description: `✅ Eliminar el rol de verificación de **${unverifiedMembers}** miembros.`
            }).setColor('Green');
            await int.editReply({ embeds: [EndEmbed] });
        });
    }
}
exports.default = YesCheckVerifications;
