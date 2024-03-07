import { readdirSync } from 'node:fs'
import path from 'node:path'
import { type CacheType, type ChatInputCommandInteraction, Client, Collection, type RESTPostAPIChatInputApplicationCommandsJSONBody, type ButtonInteraction, type AutocompleteInteraction, EmbedBuilder, type Guild } from 'discord.js'
import { BOT_DATA, CACHE } from './utils/data'
import type { EventNames, ButtonIDKeys } from './types'
import { connect } from 'mongoose'
import { BUTTON_IDS, CHANNEL_IDS } from './utils/constants'
import { databaseConnectionReady } from './lib/db'
import { IS_DEVELOPMENT } from './utils/config'

const rootFolder = __dirname.slice(__dirname.lastIndexOf(path.sep) + 1)

export class BotClient extends Client {
  public readonly data = BOT_DATA
  public cache = CACHE
  public slashCommands = new Collection<string, ClientSlashCommand>()
  public buttonHandlers = new Collection<string, ClientButtonInteraction>()
  public autocompleteHandlers = new Collection<string, ClientAutocompleteInteraction>()

  constructor () {
    super({
      intents: 131071
    })
  }

  public async start (token: string, dbUrl: string) {
    console.log('🚀 Client starting')
    try {
      await connect(dbUrl)
      console.log('🟢 Connected to the database')

      process.on('unhandledRejection', (error: Error) => {
        this.manageError('❌ Process error:', error)
      })

      databaseConnectionReady()

      // ? Load events
      readdirSync(`./${rootFolder}/events/`).forEach(async file => {
        const { default: Constructor } = await import(`../${rootFolder}/events/${file}`)
        const event: ClientEvent = new Constructor()

        if (event.isOnce) this.once(event.name, async (...args) => { await event.execute(...args, this) })
        else this.on(event.name, async (...args) => { await event.execute(...args, this) })
      })

      this.loadInteractions('chatInput', this.slashCommands, (data) => data.struct.name)
      this.loadInteractions('button', this.buttonHandlers, (data) => BUTTON_IDS[data.buttonIDKey])
      this.loadInteractions('autocomplete', this.autocompleteHandlers, (data) => data.commandName)
      this.login(token)
    } catch (error) {
      this.manageError('🔴 An error occurred while starting the bot', error)
    }
  }

  private loadInteractions <T = any> (interactionFolder: string, Group: Collection<string, T>, getKey: (data: T) => string) {
    readdirSync(`./${rootFolder}/interactions/${interactionFolder}/`).forEach(async file => {
      const Constructor = (await import(`../${rootFolder}/interactions/${interactionFolder}/${file}`)).default
      const element: T = new Constructor()

      Group.set(getKey(element), element)
    })
  }

  public manageError (message: string, error: unknown) {
    if (error instanceof Error) {
      console.error(message, error.name, error.message, error.cause)
      console.error(error)
    } else {
      console.error(message, error)
    }

    if (IS_DEVELOPMENT !== undefined) return

    const channel = this.getChannel(CHANNEL_IDS.LOG)
    if (channel !== undefined && channel.isTextBased()) {
      const ErrorLogEmbed = new EmbedBuilder({
        title: '❓ Error',
        description: `${message} ${error as string}`.slice(0, 4000)
      }).setColor('Red')
      channel.send({ embeds: [ErrorLogEmbed] })
    }
  }

  public getGuild (guildId: string) {
    return this.guilds.cache.get(guildId)
  }

  public getChannel (channelId: string) {
    return this.channels.cache.get(channelId)
  }

  public async userInGuild (guild: Guild, userId: string) {
    try {
      await guild.members.fetch(userId)
      return true
    } catch (error) {
      return false
    }
  }
}

export abstract class ClientEvent {
  public readonly name: EventNames
  public readonly isOnce: boolean

  constructor (name: EventNames, isOnce: boolean = false) {
    this.name = name
    this.isOnce = isOnce
  }

  public abstract execute (...args: any[]): Promise<void>
}

export type SlashInteraction = ChatInputCommandInteraction<CacheType>

export class ClientSlashCommand {
  public readonly struct

  constructor (
    struct: RESTPostAPIChatInputApplicationCommandsJSONBody,
    execute: (interaction: SlashInteraction, client: BotClient) => Promise<void>
  ) {
    this.struct = struct
    this.execute = execute
  }

  public execute
}

export class ClientButtonInteraction {
  public readonly buttonIDKey

  constructor (buttonIDKey: ButtonIDKeys, execute: (interaction: ButtonInteraction<CacheType>, client: BotClient) => Promise<void>) {
    this.buttonIDKey = buttonIDKey
    this.execute = execute
  }

  public execute
}

export class ClientAutocompleteInteraction {
  public readonly commandName

  constructor (commandName: string, execute: (interaction: AutocompleteInteraction<CacheType>, client: BotClient) => Promise<void>) {
    this.commandName = commandName
    this.execute = execute
  }

  public execute
}
