"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameQueue = void 0;
const mongoose_1 = require("mongoose");
const GameQueueSchema = new mongoose_1.Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true }
});
exports.GameQueue = (0, mongoose_1.model)('GameQueue', GameQueueSchema);
