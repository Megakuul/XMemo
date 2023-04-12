import { Schema, Document, model } from "mongoose";

interface IGameQueue extends Document {
  user_id: string;
  username: string;
}

const GameQueueSchema: Schema = new Schema<IGameQueue>({
  user_id: { type: String, required: true },
  username: { type: String, required: true }
});

export const GameQueue = model<IGameQueue>('GameQueue', GameQueueSchema);