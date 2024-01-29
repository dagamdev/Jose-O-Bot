"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const IgnoreScb = new discord_js_1.SlashCommandBuilder()
    .setName('ignore')
    .setNameLocalization('es-ES', 'ignorar')
    .setDescription('Ignore main command')
    .setDescriptionLocalization('es-ES', 'Comando principal de ignorar')
    .addSubcommand(list => list
    .setName('list')
    .setNameLocalization('es-ES', 'lista')
    .setDescription('List of ignored channels.')
    .setDescriptionLocalization('es-ES', 'Lista de canales ignorados.'))
    .addSubcommand(add => add
    .setName('add')
    .setNameLocalization('es-ES', 'agregar')
    .setDescription('Add a new channel to the ignore list.')
    .setDescriptionLocalization('es-ES', 'Agrega un nuevo canal a la lista de ignorados.')
    .addChannelOption(channel => channel
    .setName('channel')
    .setNameLocalization('es-ES', 'canal')
    .setDescription('Channel to exclude from the backup.')
    .setDescriptionLocalization('es-ES', 'Canal a excluir del respaldo.')
    .setRequired(true)))
    .addSubcommand(remove => remove
    .setName('remove')
    .setNameLocalization('es-ES', 'eliminar')
    .setDescription('Remove a channel from the ignore list.')
    .setDescriptionLocalization('es-ES', 'Eliminar un canal de la lista de ignorados.')
    .addChannelOption(channel => channel
    .setName('channel')
    .setNameLocalization('es-ES', 'canal')
    .setDescription('Channel to include in the backup.')
    .setDescriptionLocalization('es-ES', 'Canal a incluir en el respaldo.')
    .setRequired(true)))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .toJSON();
class BackupSlashCommand extends client_1.ClientSlashCommand {
    constructor() {
        super(IgnoreScb, async (int, client) => {
            const { user, guildId, guild, options } = int;
            const subcommandName = options.getSubcommand(true);
            const userData = await models_1.UserModel.findOne({ userId: user.id });
            if (guildId === null || guild === null) {
                int.reply({ ephemeral: true, content: 'Este comando solo se puede ejecutar dentro de un servidor.' });
                return;
            }
            if (subcommandName === 'list') {
                const IgnoreListEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Lista de canales a excluir del respaldo',
                    description: userData === null ? '*Sin canales*' : userData.ignoreChannels.find(f => f.guildId === guildId)?.channelIDs.map(id => `<#${id}>`).join('\n') ?? '*Sin canales*'
                }).setColor(client.data.colors.default);
                int.reply({ ephemeral: true, embeds: [IgnoreListEmbed] });
            }
            if (subcommandName === 'add') {
                const channel = options.getChannel('channel', true);
                if (userData === null) {
                    models_1.UserModel.create({
                        userId: user.id,
                        ignoreChannels: [{
                                guildId,
                                channelIDs: [channel.id]
                            }]
                    });
                }
                else {
                    const guildChannels = userData.ignoreChannels.find(ic => ic.guildId === guildId);
                    if (guildChannels === undefined) {
                        userData.ignoreChannels.push({
                            guildId,
                            channelIDs: [channel.id]
                        });
                    }
                    else {
                        if (channel instanceof discord_js_1.GuildChannel && guildChannels.channelIDs.some(s => s === channel.parentId)) {
                            int.reply({ ephemeral: true, content: `El canal proporcionado (<#${channel.id}>) ya está en la lista de canales excluidos del respaldo debido a su categoría.` });
                            return;
                        }
                        guildChannels.channelIDs.push(channel.id);
                    }
                    await userData.save();
                }
                const IgnoreAddEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Canal agregado',
                    description: `El canal **<#${channel.id}>** se ha agregado a tu lista de canales a excluir del respaldo.`
                }).setColor('Green');
                int.reply({ ephemeral: true, embeds: [IgnoreAddEmbed] });
            }
            if (subcommandName === 'remove') {
                const channel = options.getChannel('channel', true);
                if (userData === null) {
                    int.reply({ ephemeral: true, content: 'No puedes eliminar ningún canal de la lista de canales a excluir del respaldo porque no tienes una lista.' });
                    return;
                }
                const guildChannels = userData.ignoreChannels.find(ic => ic.guildId === guildId);
                if (guildChannels === undefined) {
                    int.reply({ ephemeral: true, content: '!Tu lista de canales a excluir del respaldo está vacía¡' });
                    return;
                }
                if (!guildChannels.channelIDs.some(s => s === channel.id)) {
                    int.reply({ ephemeral: true, content: `El canal proporcionado *(<#${channel.id}>)* no pertenece a tu lista de canales a excluir del respaldo.` });
                    return;
                }
                guildChannels.channelIDs.splice(guildChannels.channelIDs.indexOf(channel.id), 1);
                await userData.save();
                const IgnoreRemoveEmbed = new discord_js_1.EmbedBuilder({
                    title: 'Canal eliminado',
                    description: `El canal **<#${channel.id}>** se ha eliminado de tu lista de canales a excluir del respaldo.`
                }).setColor('Green');
                int.reply({ ephemeral: true, embeds: [IgnoreRemoveEmbed] });
            }
        });
    }
}
exports.default = BackupSlashCommand;
