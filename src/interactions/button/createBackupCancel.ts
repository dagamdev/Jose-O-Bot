import { ClientButtonInteraction } from '../../client'

export default class CreateBackupCancel extends ClientButtonInteraction {
  constructor () {
    super('CREATE_BACKUP_CANCEL',
      async (int, client) => {
        // int.deferUpdate({})
        int.update({ embeds: [], components: [], content: 'Acción cancelada.' })
      }
    )
  }
}
