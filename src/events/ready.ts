import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'

export default class ReadyEvent extends ClientEvent {
  constructor () {
    super('ready', true)
  }

  public async execute (client: BotClient) {
    console.log('💻 Jose\'s client started')

    const verifyChannel = client.getChannel('')

    if (verifyChannel !== undefined && verifyChannel.isTextBased()) {
      const VerifyEmbed = new EmbedBuilder()
        .setTitle('Verificación')
        .setDescription('Has click en el boton de verificar para verificarte en el servidor de origen.')

      const VerifyButton = new ButtonBuilder()
        .setCustomId('verify')
        .setEmoji('✅')
        .setLabel('Verificar')
        .setStyle(ButtonStyle.Success)

      const VerifyComponents = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(VerifyButton)

      verifyChannel.send({ embeds: [VerifyEmbed], components: [VerifyComponents] })
    }

    const clientCommands = await client.application?.commands.fetch()
    client.slashCommands.forEach(async sc => {
      if (clientCommands !== undefined && !clientCommands.some(c => c.name === sc.struct.name)) {
        client.application?.commands.create(sc.struct).then(c => {
          console.log(`🛠️ ${c.name} command created`)
        })
      }
    })
  }
}
