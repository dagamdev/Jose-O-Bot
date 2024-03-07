"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("../../client");
const models_1 = require("../../models");
class YesCheckVerifications extends client_1.ClientButtonInteraction {
    constructor() {
        super('CHECK_VERIFICATIONS_ADD', async (int, client) => {
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
                description: '🔘 Agregar el rol de verificación a miembros.'
            }).setColor(client.data.colors.default);
            await int.update({ embeds: [StartEmbed], components: [] });
            let verifiedMembers = 0;
            for (const m of await guild.members.fetch()) {
                const member = m[1];
                if (member.user.bot)
                    continue;
                const reqGuildMember = await client.userInGuild(requiredGuild, member.id);
                const containRole = member.roles.cache.has(verifyData.rolId);
                try {
                    if (reqGuildMember && !containRole) {
                        verifiedMembers++;
                        await member.roles.add(verifyData.rolId);
                        await new Promise((resolve) => {
                            setTimeout(() => {
                                resolve(undefined);
                            }, 1000);
                        });
                    }
                }
                catch (error) {
                    client.manageError('Error in check-verification-both iterator', error);
                }
            }
            if (verifiedMembers === 0) {
                int.editReply({ content: 'Parece que no hay miembros en el servidor requerido que no tengan el rol de verificación.', embeds: [] });
                return;
            }
            const EndEmbed = new discord_js_1.EmbedBuilder({
                title: 'Acción finalizada',
                description: `✅ Agregar el rol de verificación a **${verifiedMembers}** miembros.`
            }).setColor('Green');
            await int.editReply({ embeds: [EndEmbed] });
        });
    }
}
exports.default = YesCheckVerifications;
