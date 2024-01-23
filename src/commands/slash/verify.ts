import { ChannelType, EmbedBuilder, PermissionFlagsBits, Role, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { type BotClient, ClientSlashCommand, type SlashInteraction } from '../../client'
import { VerifyModel } from '../../models'
import { CUSTOM_IDS } from '../../utils/constants'

const VerifyScb = new SlashCommandBuilder()
  .setName('verify')
  .setNameLocalization('es-ES', 'verificar')
  .setDescription('Establish verification system.')
  .setDescriptionLocalization('es-ES', 'Establecer sistema de verificación.')
  .addRoleOption(role => role
    .setName('role')
    .setNameLocalization('es-ES', 'rol')
    .setDescription('Verification role.')
    .setDescriptionLocalization('es-ES', 'Rol de verificación')
    .setRequired(true)
  )
  .addStringOption(requiredServerId => requiredServerId
    .setName('server-id')
    .setNameLocalization('es-ES', 'servidor-id')
    .setDescription('Required server ID.')
    .setDescriptionLocalization('es-ES', 'ID de servidor requerido.')
    .setRequired(true)
  )
  .addChannelOption(channel => channel
    .setName('channel')
    .setNameLocalization('es-ES', 'canal')
    .setDescription('Verification channel.')
    .setDescriptionLocalization('es-ES', 'Canal de verificación.')
    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()

export default class VerifySlashCommand extends ClientSlashCommand {
  constructor () {
    super(VerifyScb)
  }

  public async execute (int: SlashInteraction, client?: BotClient) {
    const { options, guild, guildId } = int

    if (!(guild?.members.me?.permissions.has('ManageRoles') ?? false)) {
      int.reply({ ephemeral: true, content: 'Necesito el permiso para administrar roles.' })
      return
    }

    const role = options.getRole('role', true)

    if (!(role instanceof Role)) {
      console.log('Role is a instance of APIRole', role)
      return
    }

    if (role.managed) {
      int.reply({ ephemeral: true, content: `El rol <@&${role.id}> es exclusivo del bot <@${role.tags?.botId}>, no puede ser asignado a nadie más.` })
      return
    }
    if ((guild?.members.me?.roles.highest.comparePositionTo(role) ?? 0) < 1) {
      int.reply({ ephemeral: true, content: `No puedo administrar el rol <@&${role.id}>, asegúrate de que esté en una posición inferior a la de mi rol más alto.` })
      return
    }

    const channel = options.getChannel<ChannelType.GuildText | ChannelType.GuildAnnouncement>('channel')
    const requiredServerId = options.getString('server-id', true)

    const requiredServer = client?.guilds.cache.has(requiredServerId)

    if (!(requiredServer ?? false)) {
      int.reply({ ephemeral: true, content: `No me encuentro en ningún servidor con la ID \`\`${requiredServerId}\`\`, asegúrate de pasar bien la ID y de que me encuentre dentro del servidor requerido.` })
      return
    }
    if (requiredServerId === guildId) {
      int.reply({ ephemeral: true, content: 'No puedes establecer como servidor requerido este mismo servidor.' })
      return
    }

    const VerifyData = await VerifyModel.findOne({ guildId })
    const VerifyEmbed = new EmbedBuilder().setColor('Green')

    if (VerifyData === null) {
      await VerifyModel.create({
        guildId,
        rolId: role.id,
        requiredGuildId: requiredServerId
      })

      VerifyEmbed.setTitle('Verificación establecida')
        .setDescription(channel === null
          ? 'El mensaje de verificación se ha enviado en este canal.'
          : `El mensaje de verificación se ha enviado al canal <#${channel.id}>.`
        )
    } else {
      if (VerifyData.rolId === role.id && VerifyData.requiredGuildId === requiredServerId) {
        VerifyEmbed.setTitle('Mensaje de verificación enviado')
          .setDescription('No hay cambios en los datos, se envio el mensaje de verificación ' + (channel === null
            ? 'en este canal.'
            : `al canal <#${channel.id}>.`
          ))
      } else {
        VerifyData.rolId = role.id
        VerifyData.requiredGuildId = requiredServerId
        await VerifyData.save()

        VerifyEmbed.setTitle('Verificación actualizada')
          .setDescription('Se actualizaron los datos de verificación en este servidor.' + (channel === null
            ? 'El mensaje de verificación se ha enviado en este canal.'
            : `El mensaje de verificación se ha enviado al canal <#${channel.id}>.`
          ))
      }
    }

    const definitiveVerificationChannel = channel ?? int.channel

    if (definitiveVerificationChannel?.isTextBased() ?? false) {
      const VerificationEmbed = new EmbedBuilder()
        .setTitle('Verificación')
        .setDescription('Has click en el boton de verificar para verificarte en el servidor de origen.')
        .setColor('Green')

      const VerificationButton = new ButtonBuilder()
        .setCustomId(CUSTOM_IDS.VERiFY)
        .setEmoji('✅')
        .setLabel('Verificar')
        .setStyle(ButtonStyle.Success)

      const VerificationComponents = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(VerificationButton)

      await definitiveVerificationChannel?.send({
        embeds: [VerificationEmbed],
        components: [VerificationComponents]
      })
      int.reply({ ephemeral: true, embeds: [VerifyEmbed] })
      return
    }

    int.reply({ ephemeral: true, embeds: [VerifyEmbed] })
  }
}
