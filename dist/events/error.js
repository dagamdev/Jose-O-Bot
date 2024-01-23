"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class ReadyEvent extends client_1.ClientEvent {
    constructor() {
        super('error', true);
    }
    async execute(err, client) {
        console.error('Error event', err.name, err.message, err.cause);
    }
}
exports.default = ReadyEvent;
