"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../../client");
class YesCheckVerifications extends client_1.ClientButtonInteraction {
    constructor() {
        super('CHECK_VERIFICATIONS_NONE', async (int) => {
            int.update({ embeds: [], components: [], content: 'Acción cancelada.' });
        });
    }
}
exports.default = YesCheckVerifications;
