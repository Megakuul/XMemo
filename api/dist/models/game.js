import { Schema, model } from 'mongoose';
const CardSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    tag: { type: String, required: true },
    discovered: { type: Boolean, required: true },
    captured: { type: Boolean, required: true },
    owner_id: { type: String, required: false }
});
const GameSchema = new Schema({
    p1_id: { type: String, required: true },
    p2_id: { type: String, required: true },
    p1_username: { type: String, required: true },
    p2_username: { type: String, required: true },
    winner_username: { type: String },
    draw: { type: Boolean },
    active_id: { type: String },
    game_stage: { type: Number, required: true },
    moves: { type: Number, required: false },
    cards: { type: [CardSchema], required: true }
});
export const Game = model('Game', GameSchema);
