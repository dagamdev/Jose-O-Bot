"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBackupId = exports.addBackupId = void 0;
const data_1 = require("../utils/data");
function addBackupId(userId, backupId, name) {
    const backupIDs = data_1.CACHE.backupIDs.find(f => f.userId === userId);
    if (backupIDs === undefined) {
        data_1.CACHE.backupIDs.push({
            userId,
            IDs: [{
                    value: backupId,
                    name
                }]
        });
    }
    else {
        backupIDs.IDs.push({
            value: backupId,
            name
        });
    }
}
exports.addBackupId = addBackupId;
function removeBackupId(userId, backupId) {
    const backupIDs = data_1.CACHE.backupIDs.find(f => f.userId === userId);
    if (backupIDs === undefined)
        return;
    backupIDs.IDs.splice(backupIDs.IDs.findIndex(id => id.value === backupId), 1);
}
exports.removeBackupId = removeBackupId;
