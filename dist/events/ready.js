"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("../client");
const config_1 = require("../utils/config");
const constants_1 = require("../utils/constants");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('ready', true);
    }
    async execute(client) {
        console.log('💻 VIBBE\'s client started');
        if (config_1.IS_DEVELOPMENT === undefined) {
            const readyChannel = client.getChannel(constants_1.CHANNEL_IDS.LOG);
            if (readyChannel !== undefined && readyChannel.isTextBased()) {
                const ReadyEmbed = new discord_js_1.EmbedBuilder({
                    title: 'I\'m ready'
                }).setColor('Green');
                readyChannel.send({ embeds: [ReadyEmbed] });
            }
        }
        const clientCommands = await client.application?.commands.fetch();
        client.slashCommands.forEach(async (sc) => {
            if (clientCommands !== undefined && !clientCommands.some(c => c.name === sc.struct.name)) {
                client.application?.commands.create(sc.struct).then(c => {
                    console.log(`🛠️ ${c.name} command created.`);
                });
            }
        });
    }
}
exports.default = ReadyEvent;
