import { GuildMember, type CacheType, type Interaction } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'
import { CUSTOM_IDS } from '../utils/constants'
import { VerifyModel } from '../models'

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

    if (int.isButton()) {
      const { customId, guildId, member, user } = int

      if (customId === CUSTOM_IDS.VERiFY) {
        const VerifyData = await VerifyModel.findOne({ guildId })

        if (VerifyData === null) {
          int.reply({ ephemeral: true, content: 'Parece que está desactivada la verificación, ya que no he obtenido datos.' })
          return
        }

        if (!(member instanceof GuildMember)) {
          console.log('Memmber is a instance of APIInteractionGuildMember')
          int.reply({ ephemeral: true, content: 'Ha ocurrido un error.' })
          return
        }

        if (member.roles.cache.has(VerifyData.rolId)) {
          int.reply({ ephemeral: true, content: 'Ya estás verificado en el servidor.' })
          return
        }

        await int.reply({ ephemeral: true, content: 'Verificando...' })

        const requiredServer = client.getGuild(VerifyData.requiredGuildId)

        if (!(requiredServer?.members.cache.has(user.id) ?? false)) {
          await int.editReply({ content: 'No te encuentras en el servidor requerido para poder verificarte.' })
          return
        }

        setTimeout(() => {
          member?.roles.add(VerifyData.rolId).then(async () => {
            await int.editReply({ content: `✅ Verificado, te he otorgado el rol <@&${VerifyData.rolId}>.` })
          }).catch(async () => {
            await int.editReply({ content: 'Tengo problemas para asignarte el rol, por favor, repórtalo.' })
          })
        }, 1000)
      }
    }
  }
}
