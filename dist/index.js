"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./utils/config");
const client_1 = require("./client");
new client_1.BotClient().start(config_1.SECRET_KEY, config_1.DB_URL);
