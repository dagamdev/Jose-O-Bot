import { type BotClient, ClientEvent } from '../client'

export default class ReadyEvent extends ClientEvent {
  constructor () {
    super('ready', true)
  }

  public async execute (client: BotClient) {
    console.log('💻 VIBBE\'s client started')

    const clientCommands = await client.application?.commands.fetch()
    client.slashCommands.forEach(async sc => {
      if (clientCommands !== undefined && !clientCommands.some(c => c.name === sc.struct.name)) {
        client.application?.commands.create(sc.struct).then(c => {
          console.log(`🛠️ ${c.name} command created.`)
        })
      }
    })
  }
}
