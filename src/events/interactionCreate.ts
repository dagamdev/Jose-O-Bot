import { type CacheType, type Interaction } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'

export default class InteractionCreateEvent extends ClientEvent {
  constructor () {
    super('interactionCreate')
  }

  public async execute (int: Interaction<CacheType>, client: BotClient) {
    if (int.isChatInputCommand()) {
      const { commandName, user } = int

      const command = client.slashCommands.get(commandName)

      if (command !== undefined) {
        console.log(`Executed ${commandName} command by ${user.username}`)
        try {
          await command.execute(int, client)
        } catch (error) {
          client.manageError(`🔄️ Error executing the command ${commandName}.`, error)
        }
      }
    }

    if (int.isButton()) {
      const { customId, user } = int

      const buttonHandler = client.buttonHandlers.get(customId)

      if (buttonHandler !== undefined) {
        console.log(`Pulsed ${customId} button by ${user.username}`)
        try {
          await buttonHandler.execute(int, client)
        } catch (error) {
          client.manageError(`🔄️ Error executing the button handler ${customId}.`, error)
        }
      }
    }

    if (int.isAutocomplete()) {
      const { commandName } = int

      const autocompletedHandler = client.autocompleteHandlers.get(commandName)

      if (autocompletedHandler !== undefined) {
        try {
          await autocompletedHandler.execute(int, client)
        } catch (error) {
          client.manageError(`🔄️ Error executing the autocompleted handler ${commandName}.`, error)
        }
      }
    }
  }
}
