import { Schema, model } from "mongoose";
const GameQueueSchema = new Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    ranking: { type: Number, required: true },
    title: { type: String, required: true },
    createdAt: { type: Date, expires: 60, default: Date.now }
});
export const GameQueue = model('GameQueue', GameQueueSchema);
