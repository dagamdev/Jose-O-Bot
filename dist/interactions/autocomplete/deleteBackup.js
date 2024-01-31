"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
class LoadBackupAutocompleted extends client_1.ClientAutocompleteInteraction {
    constructor() {
        super('delete', async (int, client) => {
            const { user } = int;
            const focusedValue = int.options.getFocused();
            const backupIDs = client.cache.backupIDs.find(f => f.userId === user.id);
            if (backupIDs === undefined) {
                await int.respond([]);
                return;
            }
            const filtered = backupIDs.IDs.filter(id => id.name.toLowerCase().includes(focusedValue.toLowerCase()));
            await int.respond(filtered.slice(0, 25));
        });
    }
}
exports.default = LoadBackupAutocompleted;
