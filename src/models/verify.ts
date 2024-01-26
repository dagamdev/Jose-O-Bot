import { model, Schema } from 'mongoose'

export const VerifyModel = model('verify', new Schema({
  guildId: { type: String, require: true },
  requiredGuildId: { type: String, require: true },
  rolId: { type: String, require: true },
  inviteUrl: { type: String, require: true }
}))
