"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('shardError', true);
    }
    async execute(err, shardId, client) {
        client.manageError(`❓ Shard ID: ${shardId}`, err.name);
    }
}
exports.default = ReadyEvent;
