import {Document, Schema, Model, model} from 'mongoose';

export interface IWarn extends Document {
  chatId: number
  memberId: number,
  memberName: string,
  contributor: string;
}

export const WarnSchema = new Schema({
  chatId: {
    type: Number,
    required: true
  },
  memberId: {
    type: Number,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  contributor: {
    type: String,
    required: true,
  },
});

export const Warn: Model<IWarn> = model<IWarn>('Warn', WarnSchema);