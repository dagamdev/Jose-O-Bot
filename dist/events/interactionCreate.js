"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
class InteractionCreateEvent extends client_1.ClientEvent {
    constructor() {
        super('interactionCreate');
    }
    async execute(int, client) {
        if (int.isChatInputCommand()) {
            const { commandName } = int;
            const command = client.slashCommands.get(commandName);
            if (command !== undefined) {
                try {
                    await command.execute(int, client);
                }
                catch (error) {
                    client.manageError(`🔄️ Error executing the command ${commandName}.`, error);
                }
            }
        }
        if (int.isButton()) {
            const { customId } = int;
            const buttonHandler = client.buttonHandlers.get(customId);
            if (buttonHandler !== undefined) {
                try {
                    await buttonHandler.execute(int, client);
                }
                catch (error) {
                    client.manageError(`🔄️ Error executing the button handler ${customId}.`, error);
                }
            }
        }
        if (int.isAutocomplete()) {
            const { commandName } = int;
            const autocompletedHandler = client.autocompleteHandlers.get(commandName);
            if (autocompletedHandler !== undefined) {
                try {
                    await autocompletedHandler.execute(int, client);
                }
                catch (error) {
                    client.manageError(`🔄️ Error executing the autocompleted handler ${commandName}.`, error);
                }
            }
        }
    }
}
exports.default = InteractionCreateEvent;
