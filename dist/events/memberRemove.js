"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
const discord_js_1 = require("discord.js");
const models_1 = require("../models");
class MemberRemoveEvent extends client_1.ClientEvent {
    constructor() {
        super('guildMemberRemove');
    }
    async execute(member, client) {
        const { guild } = member;
        const verifyData = await models_1.VerifyModel.findOne({ requiredGuildId: guild.id });
        if (verifyData !== null) {
            const verifyGuild = client.getGuild(verifyData.guildId);
            if (verifyGuild !== undefined) {
                verifyGuild.members.cache.get(member.id)?.roles.remove(verifyData.rolId).then(() => {
                    const MemberRemoveRoleEmbed = new discord_js_1.EmbedBuilder({
                        title: `⚠️ Te he retirado el rol de verificación en el servidor ${verifyGuild.name}.`,
                        description: `Al salir del servidor requerido para la verificación, te he eliminado el rol de verificación dentro de **${verifyGuild.name}**.`,
                        footer: {
                            text: 'Es obligatorio permanecer en el servidor requerido para la verificación.'
                        }
                    }).setColor('Yellow');
                    member.send({ embeds: [MemberRemoveRoleEmbed] });
                }).catch((e) => {
                    console.log('El rol no se pudo eliminar del miembro ', e);
                });
            }
        }
    }
}
exports.default = MemberRemoveEvent;
