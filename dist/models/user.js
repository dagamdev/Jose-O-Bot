"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
exports.UserModel = (0, mongoose_1.model)('User', new mongoose_1.Schema({
    userId: { type: String, required: true },
    backups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Backup' }],
    ignoreChannels: [{
            guildId: { type: String, required: true },
            channelIDs: [{ type: String, required: true }]
        }]
}, {
    timestamps: true
}));
