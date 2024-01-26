import { GuildMember, type CacheType, type Interaction } from 'discord.js'
import { type BotClient, ClientEvent } from '../client'
import { CUSTOM_IDS } from '../utils/constants'
import { UserModel, VerifyModel } from '../models'

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
          console.error(`Error executing ${commandName} Slash command`, error)
        }
      }
    }

    if (int.isButton()) {
      const { customId, guildId, guild, member, user } = int

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

        if (requiredServer === undefined) {
          await int.editReply({ content: 'No encuentro el servidor requerido. Por favor, reporta este problema.' })
          return
        }

        const guildInvite = VerifyData.inviteUrl

        if (!requiredServer.members.cache.has(user.id)) {
          await int.editReply({ content: `No te encuentras en el servidor ${guildInvite === undefined ? requiredServer.name : `[${requiredServer.name}](${guildInvite})`} para poder verificarte.` })
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

      if (customId === CUSTOM_IDS.CREATE_BACKUP_CONFIRM) {
        if (guild === null) {
          int.update({ embeds: [], components: [], content: 'No estás dentro de un servidor.' })
          return
        }

        let userData = await UserModel.findOne({ userId: user.id })
        userData ??= await UserModel.create({
          userId: user.id
        })

        guild.channels.cache.forEach(ch => {

        })
        await int.update({ embeds: [], components: [], content: 'Creando respaldo del servidor...' })
      }

      if (customId === CUSTOM_IDS.CREATE_BACKUP_CANCEL) {
        // int.deferUpdate({})
        int.update({ embeds: [], components: [], content: 'Acción cancelada.' })
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
