import {Document, Schema, Model, model} from 'mongoose';

export interface IChat extends Document {
  id: number;
  warnsToBan: number;
  lang: string;
  admins: any;
  creator: number;
}

export const ChatSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  warnsToBan: {
    type: Number,
    default: 3,
    required: true
  },
  lang: {
    type: String,
    enum: ['en', 'ru'],
    default: 'en',
    required: true
  },
  admins: {
    type: Schema.Types.Mixed,
    required: true,
    default: []
  },
  creator: {
    type: Number,
    // required: true
  }
});

export const Chat: Model<IChat> = model<IChat>('Chat', ChatSchema);