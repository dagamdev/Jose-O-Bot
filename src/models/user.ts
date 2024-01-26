import { model, Schema, Types } from 'mongoose'

export const UserModel = model('User', new Schema({
  userId: { type: String, required: true },
  backups: [{ type: Types.ObjectId, ref: 'Backup' }]
}, {
  timestamps: true
}))
