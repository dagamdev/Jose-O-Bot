"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSlashCommand = exports.ClientEvent = exports.BotClient = void 0;
const node_fs_1 = require("node:fs");
const discord_js_1 = require("discord.js");
const data_1 = require("./utils/data");
const mongoose_1 = require("mongoose");
class BotClient extends discord_js_1.Client {
    data = data_1.BOT_DATA;
    slashCommands = new discord_js_1.Collection();
    constructor() {
        super({
            intents: 131071
        });
    }
    async start(token, dbUrl) {
        console.log('🚀 Client starting');
        try {
            await (0, mongoose_1.connect)(dbUrl);
            console.log('🟢 Connected to the database');
            this.loadEvents();
            this.loadCommands();
            this.login(token);
        }
        catch (error) {
            console.log('🔴 An error occurred while starting the bot', error);
        }
    }
    loadEvents() {
        (0, node_fs_1.readdirSync)('./src/events/').forEach(async (file) => {
            const Constructor = (await Promise.resolve(`${`../src/events/${file}`}`).then(s => __importStar(require(s)))).default;
            const event = new Constructor();
            if (event.isOnce)
                this.once(event.name, async (...args) => { await event.execute(...args, this); });
            else
                this.on(event.name, async (...args) => { await event.execute(...args, this); });
        });
    }
    loadCommands() {
        (0, node_fs_1.readdirSync)('./src/commands/slash/').forEach(async (file) => {
            const Constructor = (await Promise.resolve(`${`../src/commands/slash/${file}`}`).then(s => __importStar(require(s)))).default;
            const command = new Constructor();
            this.slashCommands.set(command.struct.name, command);
        });
    }
    getGuild(guildId) {
        return this.guilds.cache.get(guildId);
    }
    getChannel(channelId) {
        return this.channels.cache.get(channelId);
    }
}
exports.BotClient = BotClient;
class ClientEvent {
    name;
    isOnce;
    constructor(name, isOnce = false) {
        this.name = name;
        this.isOnce = isOnce;
    }
}
exports.ClientEvent = ClientEvent;
class ClientSlashCommand {
    struct;
    constructor(struct) {
        this.struct = struct;
    }
}
exports.ClientSlashCommand = ClientSlashCommand;
