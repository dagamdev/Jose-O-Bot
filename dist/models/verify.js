"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyModel = void 0;
const mongoose_1 = require("mongoose");
exports.VerifyModel = (0, mongoose_1.model)('verify', new mongoose_1.Schema({
    guildId: { type: String, required: true },
    requiredGuildId: { type: String, required: true },
    rolId: { type: String, required: true },
    inviteUrl: { type: String, required: true }
}));
