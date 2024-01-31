import { ChannelType, EmbedBuilder, PermissionFlagsBits, Role, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, CategoryChannel, ThreadChannel } from 'discord.js'
import { ClientSlashCommand } from '../../client'
import { VerifyModel } from '../../models'
import { BUTTON_IDS } from '../../utils/constants'

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
    super(VerifyScb,
      async (int, client) => {
        const { options, guild, guildId } = int

        if (guild === null) {
          int.reply({ ephemeral: true, content: 'Este comando solo se puede utilizar dentro de un servidor.' })
          return
        }

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

        const requiredServer = client.getGuild(requiredServerId)

        if (requiredServer === undefined) {
          int.reply({ ephemeral: true, content: `No me encuentro en ningún servidor con la ID \`\`${requiredServerId}\`\`, asegúrate de pasar bien la ID y de que me encuentre dentro del servidor requerido.` })
          return
        }
        if (requiredServerId === guildId) {
          int.reply({ ephemeral: true, content: 'No puedes establecer como servidor requerido este mismo servidor.' })
          return
        }

        await int.deferReply({ ephemeral: true })

        const VerifyData = await VerifyModel.findOne({ guildId })
        const VerifyEmbed = new EmbedBuilder().setColor('Green')

        let inviteUrl = ''

        if (VerifyData === null) {
          const firstChannel = requiredServer.channels.cache.find(ch => {
            return ch.type !== ChannelType.GuildCategory && ch.permissionsFor(client.user?.id ?? '')?.has('CreateInstantInvite')
          })

          if (firstChannel === undefined) {
            int.editReply({ content: 'No puedo crear invitaciones en el servidor requerido. Por favor, otórgame los permisos necesarios para crear invitaciones en algún canal.' })
            return
          }
          if (firstChannel instanceof CategoryChannel || firstChannel instanceof ThreadChannel) {
            console.log('Canal con permisos para crear invitación, tipo', firstChannel.type)
            int.editReply({ content: 'No puedo crear invitaciones en el servidor requerido. Por favor, otórgame los permisos necesarios para crear invitaciones en algún canal.' })
            return
          }

          const newInvite = await firstChannel.createInvite({ maxAge: 0 })

          inviteUrl = newInvite.url
          await VerifyModel.create({
            guildId,
            rolId: role.id,
            requiredGuildId: requiredServerId,
            inviteUrl
          })

          VerifyEmbed.setTitle('Verificación establecida')
            .setDescription(channel === null
              ? 'El mensaje de verificación se ha enviado en este canal.'
              : `El mensaje de verificación se ha enviado al canal <#${channel.id}>.`
            )
        } else {
          inviteUrl = VerifyData.inviteUrl
          try {
            await client.fetchInvite(VerifyData.inviteUrl)
          } catch (error: unknown) {
            console.error('Invitación invalida')

            const firstChannel = requiredServer.channels.cache.find(ch => {
              return ch.type !== ChannelType.GuildCategory && ch.permissionsFor(client.user?.id ?? '')?.has('CreateInstantInvite')
            })

            if (firstChannel === undefined) {
              int.reply({ ephemeral: true, content: 'No puedo crear invitaciones en el servidor requerido. Por favor, otórgame los permisos necesarios para crear invitaciones en algún canal.' })
              return
            }
            if (firstChannel instanceof CategoryChannel || firstChannel instanceof ThreadChannel) {
              console.log('Canal con permisos para crear invitación, tipo', firstChannel.type)
              int.reply({ ephemeral: true, content: 'No puedo crear invitaciones en el servidor requerido. Por favor, otórgame los permisos necesarios para crear invitaciones en algún canal.' })
              return
            }

            const newInvite = await firstChannel.createInvite({ maxAge: 0 })
            inviteUrl = newInvite.url

            VerifyData.inviteUrl = inviteUrl
            await VerifyData.save()
          }

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
              .setDescription('Se actualizaron los datos de verificación en este servidor.\n' + (channel === null
                ? 'El mensaje de verificación se ha enviado en este canal.'
                : `El mensaje de verificación se ha enviado al canal <#${channel.id}>.`
              ))
          }
        }

        if (inviteUrl.length === 0) {
          await int.editReply({ content: 'No he podido obtener el enlace de invitación del servidor. Notifica de este error.' })
          return
        }

        const definitiveVerificationChannel = channel ?? int.channel

        if (definitiveVerificationChannel?.isTextBased() ?? false) {
          const VerificationEmbed = new EmbedBuilder()
            .setTitle('Verificación')
            .setDescription('¡Hola! Antes de explorar nuestro contenido, únete a nuestro servidor de respaldo dando __clik al botón “Server”__ para realizar la verificación, luego de ingresar, da __clik en el botón “verificar”__. ¡Listo para disfrutar!')
            .setColor(client.data.colors.default)

          const VerificationButton = new ButtonBuilder()
            .setCustomId(BUTTON_IDS.VERiFY)
            .setEmoji('✅')
            .setLabel('Verificar')
            .setStyle(ButtonStyle.Success)

          const ServerLinkButton = new ButtonBuilder()
            .setEmoji('🔗')
            .setLabel('Server')
            .setStyle(ButtonStyle.Link)
            .setURL(inviteUrl)

          const VerificationComponents = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(VerificationButton, ServerLinkButton)

          await definitiveVerificationChannel?.send({
            embeds: [VerificationEmbed],
            components: [VerificationComponents]
          })
          await int.editReply({ embeds: [VerifyEmbed] })
        } else int.editReply({ embeds: [VerifyEmbed] })
      }
    )
  }
}
