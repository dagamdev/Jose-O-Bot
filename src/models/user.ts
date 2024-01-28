import { model, Schema, type Types } from 'mongoose'

interface User {
  userId: string
  backups: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export const UserModel = model<User>('User', new Schema({
  userId: { type: String, required: true },
  backups: [{ type: Schema.Types.ObjectId, ref: 'Backup' }]
}, {
  timestamps: true
}))
