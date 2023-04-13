"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const mongoose_1 = require("mongoose");
const CardSchema = new mongoose_1.Schema({
    tag: { type: String, required: true },
    discovered: { type: Boolean, required: true },
    captured: { type: Boolean, required: true },
    owner_id: { type: String, required: false },
    partner_tag: { type: String, required: true }
});
const GameSchema = new mongoose_1.Schema({
    p1_id: { type: String, required: true },
    p2_id: { type: String, required: true },
    p1_username: { type: String, required: true },
    p2_username: { type: String, required: true },
    cards: { type: [CardSchema], required: true }
});
exports.Game = (0, mongoose_1.model)('Game', GameSchema);
