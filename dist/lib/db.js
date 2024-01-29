"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConnectionReady = void 0;
const models_1 = require("../models");
const data_1 = require("../utils/data");
function databaseConnectionReady() {
    models_1.UserModel.find().populate('backups').then(users => {
        users.forEach(user => {
            data_1.CACHE.backupIDs.push({
                userId: user.userId,
                IDs: user.backups.map((backup) => {
                    return {
                        value: backup.id,
                        name: `${backup.guild.name} | ${backup.createdAt.toLocaleDateString()} | ${backup.id}`
                    };
                })
            });
        });
    });
}
exports.databaseConnectionReady = databaseConnectionReady;
