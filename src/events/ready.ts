import { EmbedBuilder } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'
import { IS_DEVELOPMENT } from '../utils/config'
import { CHANNEL_IDS } from '../utils/constants'

export default class ReadyEvent extends ClientEvent {
  constructor () {
    super('ready', true)
  }

  public async execute (client: BotClient) {
    console.log('💻 VIBBE\'s client started')

    if (IS_DEVELOPMENT === undefined) {
      const readyChannel = client.getChannel(CHANNEL_IDS.LOG)

      if (readyChannel !== undefined && readyChannel.isTextBased()) {
        const ReadyEmbed = new EmbedBuilder({
          title: 'I\'m ready'
        }).setColor('Green')

        readyChannel.send({ embeds: [ReadyEmbed] })
      }
    }

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
