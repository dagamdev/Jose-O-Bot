import { ClientButtonInteraction } from '../../client'

export default class LoadBackupConfirm extends ClientButtonInteraction {
  constructor () {
    super('LOAD_BACKUP_CONFIRM',
      async (int) => {
        int.update({ embeds: [], components: [], content: 'Acción cancelada.' })
      }
    )
  }
}
