import { ClientAutocompleteInteraction } from '../../client'

export default class LoadBackupAutocompleted extends ClientAutocompleteInteraction {
  constructor () {
    super('delete',
      async (int, client) => {
        const { user } = int
        const focusedValue = int.options.getFocused()

        const backupIDs = client.cache.backupIDs.find(f => f.userId === user.id)

        if (backupIDs === undefined) {
          await int.respond([])
          return
        }

        const filtered = backupIDs.IDs.filter(id => id.name.toLowerCase().includes(focusedValue.toLowerCase()))
        await int.respond(
          filtered.slice(0, 25)
        )
      }
    )
  }
}
