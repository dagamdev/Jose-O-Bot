import { type CacheType, type Interaction } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'

export default class InteractionCreateEvent extends ClientEvent {
  constructor () {
    super('interactionCreate')
  }

  public async execute (int: Interaction<CacheType>, client: BotClient) {
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
      console.log(int.commandName)

      const focusedValue = int.options.getFocused()
      console.log(focusedValue)
      const choices = [
        'Popular', 'Topics', ' Threads', 'Sharding', 'Getting',
        'started', 'Library', 'Voice', 'Connections', 'Interactions:',
        'Replying', 'to', 'slash', 'commands', 'Popular',
        'Topics:', 'Embed', 'preview', 'Rojo', 'Blanco',
        'Verde', 'Naranja', 'Majenta', 'Azul', 'Avena',
        'Abeja'
      ]
      const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
      await int.respond(
        filtered.map(choice => ({ name: choice, value: choice })).slice(0, 25)
      )
    }
  }
}
