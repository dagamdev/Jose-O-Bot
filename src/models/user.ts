import { model, Schema, type Types } from 'mongoose'

interface User {
  userId: string
  backups: Types.ObjectId[]
  ignoreChannels: Array<{
    guildId: string
    channelIDs: string[]
  }>
  createdAt: Date
  updatedAt: Date
}

export const UserModel = model<User>('User', new Schema({
  userId: { type: String, required: true },
  backups: [{ type: Schema.Types.ObjectId, ref: 'Backup' }],
  ignoreChannels: [{
    guildId: { type: String, required: true },
    channelIDs: [{ type: String, required: true }]
  }]
}, {
  timestamps: true
}))
