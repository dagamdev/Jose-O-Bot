"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetVerifiedRoleData = exports.handleVerifiedRole = exports.addIdToVerification = exports.generateCode = void 0;
const data_1 = require("../utils/data");
function generateCode(length = 6) {
    if (typeof length !== 'number')
        length = 6;
    let res = '';
    for (let i = 0; i < length; i++) {
        res += Math.floor(Math.random() * 22).toString(22);
    }
    return res;
}
exports.generateCode = generateCode;
function addIdToVerification(guildId, memberId, type) {
    let verificationData = data_1.CACHE.verifications.find(v => v.guildId === guildId);
    const existData = verificationData !== undefined;
    if (verificationData === undefined) {
        verificationData = {
            guildId,
            addRole: [],
            removeRole: []
        };
    }
    const roleType = type === 'ADD' ? 'addRole' : 'removeRole';
    const exist = verificationData[roleType].includes(memberId);
    if (!exist) {
        verificationData[roleType].push(memberId);
    }
    if (!existData) {
        data_1.CACHE.verifications.push(verificationData);
    }
}
exports.addIdToVerification = addIdToVerification;
async function handleVerifiedRole(guild, rolId, type) {
    const verificationData = data_1.CACHE.verifications.find(v => v.guildId === guild.id);
    if (verificationData === undefined)
        return;
    const roleType = type === 'ADD' ? 'addRole' : 'removeRole';
    const memberIDs = verificationData[roleType];
    let counter = 0;
    for (const memberId of memberIDs) {
        const member = guild.members.cache.get(memberId);
        if (member === undefined)
            continue;
        try {
            await member.roles[type === 'ADD' ? 'add' : 'remove'](rolId);
        }
        catch (error) {
            console.error(error);
        }
        counter++;
        verificationData[roleType] = verificationData[roleType].filter(mi => mi === memberId);
    }
    return counter;
}
exports.handleVerifiedRole = handleVerifiedRole;
function resetVerifiedRoleData(guildId) {
    data_1.CACHE.verifications.splice(data_1.CACHE.verifications.findIndex(v => v.guildId === guildId), 1);
}
exports.resetVerifiedRoleData = resetVerifiedRoleData;
