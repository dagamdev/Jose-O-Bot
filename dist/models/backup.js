"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupModel = void 0;
const mongoose_1 = require("mongoose");
const lib_1 = require("../lib");
const GuildSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String
});
const RoleSchema = new mongoose_1.Schema({
    oldId: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: Number, required: true },
    hoist: { type: Boolean, required: true },
    rawPosition: { type: Number, required: true },
    mentionable: { type: Boolean, required: true },
    permissions: { type: BigInt, required: true },
    icon: String,
    unicodeEmoji: String
});
const PermissionOverwrites = new mongoose_1.Schema({
    id: { type: String, required: true },
    type: { type: Number, required: true },
    deny: { type: BigInt, required: true },
    allow: { type: BigInt, required: true }
});
const MessageSchema = new mongoose_1.Schema({
    author: {
        id: { type: String, required: true },
        name: { type: String, required: true }
    },
    content: { type: String, required: true }
});
const ChannelSchema = new mongoose_1.Schema({
    oldId: { type: String, required: true },
    name: { type: String, required: true },
    parentId: String,
    position: { type: Number, required: true },
    type: { type: Number, required: true },
    nsfw: Boolean,
    rateLimitPerUser: Number,
    topic: String,
    bitrate: Number,
    rtcRegion: String,
    userLimit: Number,
    videoQualityMode: Number,
    permissionOverwrites: [PermissionOverwrites],
    messages: [MessageSchema]
});
exports.BackupModel = (0, mongoose_1.model)('Backup', new mongoose_1.Schema({
    id: { type: String, default: lib_1.generateCode },
    guild: GuildSchema,
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    roles: [RoleSchema],
    channels: [ChannelSchema]
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
}));
