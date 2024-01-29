"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('ready', true);
    }
    async execute(client) {
        console.log('💻 VIBBE\'s client started');
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
