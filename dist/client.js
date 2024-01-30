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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAutocompleteInteraction = exports.ClientButtonInteraction = exports.ClientSlashCommand = exports.ClientEvent = exports.BotClient = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const discord_js_1 = require("discord.js");
const data_1 = require("./utils/data");
const mongoose_1 = require("mongoose");
const constants_1 = require("./utils/constants");
const db_1 = require("./lib/db");
const config_1 = require("./utils/config");
const rootFolder = __dirname.slice(__dirname.lastIndexOf(node_path_1.default.sep) + 1);
class BotClient extends discord_js_1.Client {
    data = data_1.BOT_DATA;
    cache = data_1.CACHE;
    slashCommands = new discord_js_1.Collection();
    buttonHandlers = new discord_js_1.Collection();
    autocompleteHandlers = new discord_js_1.Collection();
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
            process.on('unhandledRejection', (error) => {
                this.manageError('❌ Process error:', error);
            });
            (0, db_1.databaseConnectionReady)();
            // ? Load events
            (0, node_fs_1.readdirSync)(`./${rootFolder}/events/`).forEach(async (file) => {
                const { default: Constructor } = await Promise.resolve(`${`../${rootFolder}/events/${file}`}`).then(s => __importStar(require(s)));
                const event = new Constructor();
                if (event.isOnce)
                    this.once(event.name, async (...args) => { await event.execute(...args, this); });
                else
                    this.on(event.name, async (...args) => { await event.execute(...args, this); });
            });
            this.loadInteractions('chatInput', this.slashCommands, (data) => data.struct.name);
            this.loadInteractions('button', this.buttonHandlers, (data) => constants_1.BUTTON_IDS[data.buttonIDKey]);
            this.loadInteractions('autocomplete', this.autocompleteHandlers, (data) => data.commandName);
            this.login(token);
        }
        catch (error) {
            this.manageError('🔴 An error occurred while starting the bot', error);
        }
    }
    loadInteractions(interactionFolder, Group, getKey) {
        (0, node_fs_1.readdirSync)(`./${rootFolder}/interactions/${interactionFolder}/`).forEach(async (file) => {
            const Constructor = (await Promise.resolve(`${`../${rootFolder}/interactions/${interactionFolder}/${file}`}`).then(s => __importStar(require(s)))).default;
            const element = new Constructor();
            Group.set(getKey(element), element);
        });
    }
    manageError(message, error) {
        if (error instanceof Error) {
            console.error(message, error.name, error.message, error.cause);
            console.error(error);
        }
        else {
            console.error(message, error);
        }
        if (config_1.IS_DEVELOPMENT !== undefined)
            return;
        const channel = this.getChannel(constants_1.CHANNEL_IDS.LOG);
        if (channel !== undefined && channel.isTextBased()) {
            const ErrorLogEmbed = new discord_js_1.EmbedBuilder({
                title: '❓ Error',
                description: `${message} ${error}`.slice(0, 4000)
            }).setColor('Red');
            channel.send({ embeds: [ErrorLogEmbed] });
        }
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
    constructor(struct, execute) {
        this.struct = struct;
        this.execute = execute;
    }
    execute;
}
exports.ClientSlashCommand = ClientSlashCommand;
class ClientButtonInteraction {
    buttonIDKey;
    constructor(buttonIDKey, execute) {
        this.buttonIDKey = buttonIDKey;
        this.execute = execute;
    }
    execute;
}
exports.ClientButtonInteraction = ClientButtonInteraction;
class ClientAutocompleteInteraction {
    commandName;
    constructor(commandName, execute) {
        this.commandName = commandName;
        this.execute = execute;
    }
    execute;
}
exports.ClientAutocompleteInteraction = ClientAutocompleteInteraction;
