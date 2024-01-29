"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('error', true);
    }
    async execute(err, client) {
        client.manageError('❗ Error event:', err);
    }
}
exports.default = ReadyEvent;
