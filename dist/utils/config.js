"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_DEVELOPMENT = exports.DB_URL = exports.SECRET_KEY = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.SECRET_KEY = process.env.SECRET_KEY ?? 'token';
exports.DB_URL = process.env.DB_URL ?? 'connection';
exports.IS_DEVELOPMENT = process.env.IS_DEVELOPMENT;
