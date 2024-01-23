import { readdirSync } from 'node:fs'
import { type CacheType, type ChatInputCommandInteraction, Client, Collection, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js'
import { BOT_DATA } from './utils/data'
import type { EventNames } from './types'
import { connect } from 'mongoose'

export class BotClient extends Client {
  public data = BOT_DATA
  public slashCommands = new Collection<string, ClientSlashCommand>()

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

      this.loadEvents()
      this.loadCommands()
      this.login(token)
    } catch (error) {
      console.log('🔴 An error occurred while starting the bot', error)
    }
  }

  private loadEvents () {
    readdirSync('./src/events/').forEach(async file => {
      const Constructor = (await import(`../src/events/${file}`)).default
      const event: ClientEvent = new Constructor()

      if (event.isOnce) this.once(event.name, async (...args) => { await event.execute(...args, this) })
      else this.on(event.name, async (...args) => { await event.execute(...args, this) })
    })
  }

  private loadCommands () {
    readdirSync('./src/commands/slash/').forEach(async file => {
      const Constructor = (await import(`../src/commands/slash/${file}`)).default
      const command: ClientSlashCommand = new Constructor()

      this.slashCommands.set(command.struct.name, command)
    })
  }

  public getGuild (guildId: string) {
    return this.guilds.cache.get(guildId)
  }

  public getChannel (channelId: string) {
    return this.channels.cache.get(channelId)
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

export abstract class ClientSlashCommand {
  public readonly struct: RESTPostAPIChatInputApplicationCommandsJSONBody

  constructor (struct: RESTPostAPIChatInputApplicationCommandsJSONBody) {
    this.struct = struct
  }

  public abstract execute (interaction: SlashInteraction, client?: BotClient): Promise<void>
}
