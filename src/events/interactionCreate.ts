import { type CacheType, type Interaction } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'

export default class InteractionCreateEvent extends ClientEvent {
  constructor () {
    super('interactionCreate')
  }

  public async execute (int: Interaction<CacheType>, client: BotClient) {
    if (int.user.id !== '717420870267830382') return

    if (int.isChatInputCommand()) {
      const { commandName } = int

      const command = client.slashCommands.get(commandName)

      if (command !== undefined) {
        try {
          await command.execute(int, client)
        } catch (error) {
          console.error(`Error executing the command ${commandName}.`, error)
        }
      }
    }

    if (int.isButton()) {
      const { customId } = int

      const buttonHandler = client.buttonHandlers.get(customId)

      if (buttonHandler !== undefined) {
        try {
          await buttonHandler.execute(int, client)
        } catch (error) {
          console.error(`Error executing the button handler ${customId}.`, error)
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
          console.error(`Error executing the autocompleted handler ${commandName}.`, error)
        }
      }
    }
  }
}
