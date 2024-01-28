import { ClientButtonInteraction } from '../../client'

export default class LoadBackupCancel extends ClientButtonInteraction {
  constructor () {
    super('LOAD_BACKUP_CANCEL',
      async (int) => {
        int.update({ embeds: [], components: [], content: 'Acción cancelada.' })
      }
    )
  }
}
