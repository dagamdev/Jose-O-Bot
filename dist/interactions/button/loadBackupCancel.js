"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
class LoadBackupCancel extends client_1.ClientButtonInteraction {
    constructor() {
        super('LOAD_BACKUP_CANCEL', async (int) => {
            int.update({ embeds: [], components: [], content: 'Acción cancelada.' });
        });
    }
}
exports.default = LoadBackupCancel;
