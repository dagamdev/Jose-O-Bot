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

      if (command !== undefined) command.execute(int, client)
    }
  }
}
