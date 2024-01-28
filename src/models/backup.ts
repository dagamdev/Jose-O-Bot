import { model, Schema, type Types } from 'mongoose'
import { generateCode } from '../lib'

interface Guild {
  id: string
  name: string
  description: string | null
}

const GuildSchema = new Schema<Guild>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String
})

interface Role {
  oldId: string
  name: string
  color: number
  hoist: boolean
  rawPosition: number
  mentionable: boolean
  permissions: bigint
  icon: string | null
  unicodeEmoji: string | null
}

const RoleSchema = new Schema<Role>({
  oldId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: Number, required: true },
  hoist: { type: Boolean, required: true },
  rawPosition: { type: Number, required: true },
  mentionable: { type: Boolean, required: true },
  permissions: { type: BigInt, required: true },
  icon: String,
  unicodeEmoji: String
})

interface Channel {
  oldId: string
  name: string
  parentId: string | null
  position: number
  type: number
  nsfw: boolean | null
  rateLimitPerUser: number | null
  topic: string | null
  bitrate: number | null
  rtcRegion: string | null
  userLimit: number | null
  videoQualityMode: number | null
}

const ChannelSchema = new Schema<Channel>({
  oldId: { type: String, required: true },
  name: { type: String, required: true },
  parentId: String,
  position: { type: Number, required: true },
  type: { type: Number, required: true },
  nsfw: Boolean,
  rateLimitPerUser: Number,
  topic: String,
  bitrate: Number,
  rtcRegion: String,
  userLimit: Number,
  videoQualityMode: Number
})

export interface Backup {
  id: string
  guild: Guild
  user: Types.ObjectId
  roles: Role[]
  channels: Channel[]
  createdAt: Date
}

export const BackupModel = model<Backup>('Backup', new Schema({
  id: { type: String, default: generateCode },
  guild: GuildSchema,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  roles: [RoleSchema],
  channels: [ChannelSchema]
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false
  }
}))
