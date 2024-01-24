"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("../client");
const constants_1 = require("../utils/constants");
const models_1 = require("../models");
class InteractionCreateEvent extends client_1.ClientEvent {
    constructor() {
        super('interactionCreate');
    }
    async execute(int, client) {
        if (int.isChatInputCommand()) {
            const { commandName } = int;
            const command = client.slashCommands.get(commandName);
            if (command !== undefined)
                command.execute(int, client);
        }
        if (int.isButton()) {
            const { customId, guildId, member, user } = int;
            if (customId === constants_1.CUSTOM_IDS.VERiFY) {
                const VerifyData = await models_1.VerifyModel.findOne({ guildId });
                if (VerifyData === null) {
                    int.reply({ ephemeral: true, content: 'Parece que está desactivada la verificación, ya que no he obtenido datos.' });
                    return;
                }
                if (!(member instanceof discord_js_1.GuildMember)) {
                    console.log('Memmber is a instance of APIInteractionGuildMember');
                    int.reply({ ephemeral: true, content: 'Ha ocurrido un error.' });
                    return;
                }
                if (member.roles.cache.has(VerifyData.rolId)) {
                    int.reply({ ephemeral: true, content: 'Ya estás verificado en el servidor.' });
                    return;
                }
                await int.reply({ ephemeral: true, content: 'Verificando...' });
                const requiredServer = client.getGuild(VerifyData.requiredGuildId);
                if (requiredServer === undefined) {
                    await int.editReply({ content: 'No encuentro el servidor requerido. Por favor, reporta este problema.' });
                    return;
                }
                const guildInvite = client.cache.guildInvites.find(g => g.guildId === guildId)?.inviteUrl;
                if (!requiredServer.members.cache.has(user.id)) {
                    await int.editReply({ content: `No te encuentras en el servidor ${guildInvite === undefined ? requiredServer.name : `[${requiredServer.name}](${guildInvite})`} para poder verificarte.` });
                    return;
                }
                setTimeout(() => {
                    member?.roles.add(VerifyData.rolId).then(async () => {
                        await int.editReply({ content: `✅ Verificado, te he otorgado el rol <@&${VerifyData.rolId}>.` });
                    }).catch(async () => {
                        await int.editReply({ content: 'Tengo problemas para asignarte el rol, por favor, repórtalo.' });
                    });
                }, 1000);
            }
        }
    }
}
exports.default = InteractionCreateEvent;
