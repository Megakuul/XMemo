"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const mongoose_1 = require("mongoose");
const CardSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true, auto: true },
    tag: { type: String, required: true },
    discovered: { type: Boolean, required: true },
    captured: { type: Boolean, required: true },
    owner_id: { type: String, required: false }
});
const GameSchema = new mongoose_1.Schema({
    p1_id: { type: String, required: true },
    p2_id: { type: String, required: true },
    p1_username: { type: String, required: true },
    p2_username: { type: String, required: true },
    active_id: { type: String, required: true },
    game_stage: { type: Number, required: true },
    moves: { type: Number, required: false },
    cards: { type: [CardSchema], required: true }
});
exports.Game = (0, mongoose_1.model)('Game', GameSchema);
