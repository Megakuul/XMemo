import { Schema, Document, model } from "mongoose";

export interface IGameQueue extends Document {
  user_id: string;
  username: string;
  ranking: number;
  title: string;
  createdAt: Date;
}

const GameQueueSchema: Schema = new Schema<IGameQueue>({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  ranking: { type: Number, required: true },
  title: { type: String, required: true },
  // The Queue entry will be deleted after 5 Minutes
  createdAt: { type: Date, expires: 300, default: Date.now }
});

export const GameQueue = model<IGameQueue>('GameQueue', GameQueueSchema);