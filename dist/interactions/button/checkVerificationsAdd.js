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
                int.reply({ ephemeral: true, content: 'No puede ejecutar está acción fuera de un servidor.' });
                return;
            }
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
            const verifiedMembers = guild.members.cache.filter(f => (!f.user.bot) && requiredGuild.members.cache.has(f.id) && !f.roles.cache.has(verifyData.rolId));
            if (verifiedMembers.size === 0) {
                int.reply({ ephemeral: true, content: 'Parece que no hay miembros en el servidor requerido que no tengan el rol de verificación.' });
                return;
            }
            const StartEmbed = new discord_js_1.EmbedBuilder({
                title: 'Ejecutando acción...',
                description: `Se está agregando el rol de verificación a ${verifiedMembers.size} miembros que cumplen con los requisitos pero aún no lo tienen.`
            }).setColor(client.data.colors.default);
            await int.update({ embeds: [StartEmbed], components: [] });
            for (const unverified of verifiedMembers) {
                const member = unverified[1];
                try {
                    await member.roles.add(verifyData.rolId);
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(undefined);
                        }, 1000);
                    });
                }
                catch (error) {
                    client.manageError('Error in check-verification-add add role iterator', error);
                }
            }
            const EndEmbed = new discord_js_1.EmbedBuilder({
                title: 'Acción finalizada',
                description: `Se les ha agregado el rol de verificación a **${verifiedMembers.size}** miembros.`
            }).setColor('Green');
            await int.editReply({ embeds: [EndEmbed] });
        });
    }
}
exports.default = YesCheckVerifications;
