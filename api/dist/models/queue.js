import { Schema, model } from "mongoose";
const GameQueueSchema = new Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    ranking: { type: Number, required: true },
    title: { type: String, required: true },
    // The Queue entry will be deleted after 5 Minutes
    createdAt: { type: Date, expires: 300, default: Date.now }
});
export const GameQueue = model('GameQueue', GameQueueSchema);
