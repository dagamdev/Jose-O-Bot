import { type BotClient, ClientEvent } from '../client'

export default class ReadyEvent extends ClientEvent {
  constructor () {
    super('shardError', true)
  }

  public async execute (err: Error, shardId: number, client: BotClient) {
    console.error(`Shard ID: ${shardId}`, err.name, err.message, err.cause)
  }
}
