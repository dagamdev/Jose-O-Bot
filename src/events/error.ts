import { type BotClient, ClientEvent } from '../client'

export default class ReadyEvent extends ClientEvent {
  constructor () {
    super('error', true)
  }

  public async execute (err: Error, client: BotClient) {
    client.manageError('❗ Error event:', err)
  }
}
