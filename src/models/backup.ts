import { model, Schema, Types } from 'mongoose'

function generateCode (length = 6) {
  let res = ''

  for (let i = 0; i < length; i++) {
    res += Math.floor(Math.random() * 22).toString(22)
  }

  return res
}

const ChannelSchema = new Schema({
  oldId: { type: String, required: true },
  name: { type: String, required: true },
  parentId: { type: String },
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

export const BackupModel = model('backup', new Schema({
  id: { type: String, default: generateCode },
  guildId: { type: String, required: true },
  user: { type: Types.ObjectId, required: true, ref: 'User' },
  channels: [ChannelSchema]
}))
