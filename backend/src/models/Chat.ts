import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  paperId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
}

const ChatSchema: Schema = new Schema({
  paperId: { type: Schema.Types.ObjectId, ref: 'Paper', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChat>('Chat', ChatSchema);