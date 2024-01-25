import { model, Schema } from 'mongoose'

export const VerifyModel = model('verify', new Schema({
  guildId: { type: String, required: true },
  requiredGuildId: { type: String, required: true },
  rolId: { type: String, required: true },
  inviteUrl: { type: String, required: true }
}))
