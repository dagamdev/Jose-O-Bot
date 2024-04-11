"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("../../client");
const models_1 = require("../../models");
const lib_1 = require("../../lib");
class YesCheckVerifications extends client_1.ClientButtonInteraction {
    constructor() {
        super('CHECK_VERIFICATIONS_BOTH', async (int, client) => {
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
                title: 'Ejecutando acciones...',
                description: '🔘 Agregar el rol de verificación.\n🔘 Eliminar el rol de verificación.'
            }).setColor(client.data.colors.default);
            await int.update({ embeds: [StartEmbed], components: [] });
            const verifiedMembers = await (0, lib_1.handleVerifiedRole)(guild, verifyData.rolId, 'ADD');
            const unverifiedMembers = await (0, lib_1.handleVerifiedRole)(guild, verifyData.rolId, 'REMOVE');
            (0, lib_1.resetVerifiedRoleData)(guild.id);
            if (verifiedMembers === 0 && unverifiedMembers === 0) {
                int.update({ content: 'Parece que los datos han cambiado. No hay miembros sin el rol de verificación que cumplan los requisitos, ni miembros con el rol que no estén en el servidor requerido.', embeds: [] });
                return;
            }
            const EndEmbed = new discord_js_1.EmbedBuilder({
                title: 'Acciónes finalizadas',
                description: `✅ Agregar el rol de verificación a **${verifiedMembers}** miembros.\n✅ Eliminar el rol de verificación de **${unverifiedMembers}** miembros.`
            }).setColor('Green');
            await int.editReply({ embeds: [EndEmbed] });
        });
    }
}
exports.default = YesCheckVerifications;
