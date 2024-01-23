import { SlashCommandBuilder } from 'discord.js'
import { type BotClient, ClientSlashCommand, type SlashInteraction } from '../../client'

const VerifyScb = new SlashCommandBuilder()
  .setName('verify')
  .setNameLocalization('es-ES', 'verificar')
  .setDescription('Establish verification system.')
  .setDescriptionLocalization('es-ES', 'Establecer sistema de verificación.')
  .addRoleOption(role =>
    role.setName('role')
      .setDescription('Verification role.')
      .setRequired(true)
  )
  .toJSON()

export default class VerifySlashCommand extends ClientSlashCommand {
  constructor () {
    super(VerifyScb)
  }

  public async execute (interaction: SlashInteraction, client?: BotClient) {
    const { options } = interaction

    const role = options.getRole('role', true)

    console.log('Role:', role?.name)
  }
}
