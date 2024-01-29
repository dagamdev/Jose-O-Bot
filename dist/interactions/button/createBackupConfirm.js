"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const models_1 = require("../../models");
class CreateBackupConfirm extends client_1.ClientButtonInteraction {
    constructor() {
        super('CREATE_BACKUP_CONFIRM', async (int, client) => {
            const { user, guild, guildId } = int;
            if (guild === null) {
                int.update({ embeds: [], components: [], content: 'No estás dentro de un servidor.' });
                return;
            }
            await int.update({ embeds: [], components: [], content: 'Creando respaldo...' });
            let userData = await models_1.UserModel.findOne({ userId: user.id });
            userData ??= await models_1.UserModel.create({
                userId: user.id
            });
            const roles = await guild.roles.fetch();
            const channels = guild.channels.cache;
            const mappedRoles = roles.filter(f => !f.managed).map((role) => {
                return {
                    oldId: role.id,
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    rawPosition: role.rawPosition,
                    mentionable: role.mentionable,
                    permissions: role.permissions.bitfield,
                    icon: role.icon,
                    unicodeEmoji: role.unicodeEmoji
                };
            });
            const mappedChannels = [];
            for (const data of channels.filter(f => f !== null)) {
                const channel = data[1];
                const ch = channel;
                const messagesData = [];
                if (channel.isTextBased()) {
                    const messages = await channel.messages.fetch();
                    for (const msgData of messages) {
                        const msg = msgData[1];
                        if (msg.content.length !== 0) {
                            messagesData.unshift({
                                author: {
                                    id: msg.author.id,
                                    name: msg.author.displayName
                                },
                                content: msg.content
                            });
                        }
                    }
                }
                mappedChannels.push({
                    oldId: ch.id,
                    name: ch.name,
                    parentId: ch.parentId,
                    position: ch.position,
                    type: ch.type,
                    nsfw: ch.nsfw,
                    topic: ch.topic,
                    rateLimitPerUser: ch.rateLimitPerUser,
                    bitrate: ch.bitrate,
                    rtcRegion: ch.rtcRegion,
                    userLimit: ch.userLimit,
                    videoQualityMode: ch.videoQualityMode,
                    permissionOverwrites: ch.permissionOverwrites.cache.map((p) => ({
                        id: p.id,
                        type: p.type,
                        deny: p.deny.bitfield,
                        allow: p.allow.bitfield
                    })),
                    messages: messagesData
                });
            }
            channels.filter(f => f !== null).forEach((ch) => {
            });
            const newBackup = await models_1.BackupModel.create({
                user: userData._id,
                guild: {
                    id: guildId,
                    name: guild.name,
                    description: guild.description
                },
                roles: mappedRoles,
                channels: mappedChannels
            });
            userData.backups.push(newBackup._id);
            await userData.save();
            const backupIDs = client.cache.backupIDs.find(f => f.userId === user.id);
            if (backupIDs === undefined) {
                client.cache.backupIDs.push({
                    userId: user.id,
                    IDs: [{
                            value: newBackup.id,
                            name: `${guild.name} | ${newBackup.createdAt.toLocaleDateString()} | ${newBackup.id}`
                        }]
                });
            }
            else {
                backupIDs.IDs.push({
                    value: newBackup.id,
                    name: `${guild.name} | ${newBackup.createdAt.toLocaleDateString()} | ${newBackup.id}`
                });
            }
            await int.editReply({ content: `**Respaldo creado**\nID del respaldo: \`\`${newBackup.id}\`\`` });
        });
    }
}
exports.default = CreateBackupConfirm;
