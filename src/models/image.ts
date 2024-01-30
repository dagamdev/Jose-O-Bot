import { model, Schema } from 'mongoose'

interface Image {
  data: Buffer
}

export const ImageModel = model<Image>('Image', new Schema({
  data: { type: Buffer, required: true }
}))
