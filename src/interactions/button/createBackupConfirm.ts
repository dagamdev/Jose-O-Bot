import { ClientButtonInteraction } from '../../client'
import { UserModel } from '../../models'

export default class CreateBackupConfirm extends ClientButtonInteraction {
  constructor () {
    super('CREATE_BACKUP_CONFIRM',
      async (int, client) => {
        const { user, guild } = int

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
    )
  }
}
