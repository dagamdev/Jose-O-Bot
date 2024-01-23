"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('shardError', true);
    }
    async execute(err, shardId, client) {
        console.error(`Shard ID: ${shardId}`, err.name, err.message, err.cause);
    }
}
exports.default = ReadyEvent;
