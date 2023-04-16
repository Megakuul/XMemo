import { Schema, model } from "mongoose";
const GameQueueSchema = new Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true }
});
export const GameQueue = model('GameQueue', GameQueueSchema);
