"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayRouter = void 0;
const game_1 = require("../models/game");
const queue_1 = require("../models/queue");
const passport_1 = __importDefault(require("passport"));
const express = require("express");
exports.PlayRouter = express.Router();
exports.PlayRouter.post('/queue', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new queue_1.GameQueue({
            user_id: req.user._id, username: req.user.username
        }).save();
        // TODO: Check if the player is already in the queue
        if ((yield queue_1.GameQueue.countDocuments()) >= 2) {
            const p1 = yield queue_1.GameQueue.findOneAndDelete();
            const p2 = yield queue_1.GameQueue.findOneAndDelete();
            yield startGame(p1.user_id, p2.user_id);
            // TODO: Maybe redirect user to the board
            return res.status(200).json({
                message: "Successfully created game",
            });
        }
        res.status(200).json({
            message: "Successfully added player to the queue"
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error adding player to queue",
            error: err
        });
    }
}));
exports.PlayRouter.get('/queue', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queue = yield queue_1.GameQueue.find({});
        res.status(200).json({
            message: "Successfully loaded queue",
            queue: queue
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to load queue",
            error: err
        });
    }
}));
const startGame = (p1_id, p2_id) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            const game = new game_1.Game({
                p1_id: p1_id,
                p2_id: p2_id,
                cards: [
                    {
                        discovered: false,
                        captured: false,
                        symbol_path: "Test"
                    },
                    {
                        discovered: false,
                        captured: false,
                        symbol_path: "Test"
                    },
                    {
                        discovered: false,
                        captured: false,
                        symbol_path: "Test"
                    }
                ]
            });
            game.save();
            resolve();
        }
        catch (err) {
            reject(new Error(`Error creating game: ${err}`));
        }
    });
});
