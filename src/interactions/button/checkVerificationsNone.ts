import { ClientButtonInteraction } from '../../client'

export default class YesCheckVerifications extends ClientButtonInteraction {
  constructor () {
    super('CHECK_VERIFICATIONS_NONE',
      async (int) => {
        int.update({ embeds: [], components: [], content: 'Acción cancelada.' })
      }
    )
  }
}
