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
const passport_1 = __importDefault(require("passport"));
const game_1 = require("../models/game");
const queue_1 = require("../models/queue");
const gameHandler_1 = require("../game/gameHandler");
const express = require("express");
exports.PlayRouter = express.Router();
exports.PlayRouter.post('/queue', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if player was already in the queue -> remove the player from the queue
        if (yield queue_1.GameQueue.findOneAndDelete({ user_id: req.user._id })) {
            return res.status(200).json({
                message: "Successfully removed player from the queue"
            });
        }
        // Add player to the queue
        yield new queue_1.GameQueue({
            user_id: req.user._id, username: req.user.username
        }).save();
        // Check if a Game can be created
        // TODO: here could be an algorithmus to find an optimal enemy for the player
        if ((yield queue_1.GameQueue.countDocuments()) >= 2) {
            const p1 = yield queue_1.GameQueue.findOneAndDelete();
            const p2 = yield queue_1.GameQueue.findOneAndDelete();
            yield (0, gameHandler_1.createGame)(p1.user_id, p2.user_id, p1.username, p2.username, 20);
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
exports.PlayRouter.post('/move', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameid = req.query.gameid;
    const discover_id = req.body.discover_id;
    const game = yield game_1.Game.findById(gameid);
    if (!game) {
        return res.status(404).json({
            message: "Error on move",
            error: `Game with id: ${gameid} not found`
        });
    }
    if (game.active_id !== req.user._id) {
        return res.status(403).json({
            message: "Error on move",
            error: `You are not allowed to move now`
        });
    }
    // This will lock the active_id to prevent a spamming attack
    // The active_id will be re-set in the move() function below
    if (!(yield game_1.Game.findOneAndUpdate({ _id: gameid }, { $set: { active_id: undefined }, }))) {
        return res.status(500).json({
            message: "Error on move",
            error: "Failed to update the game"
        });
    }
    // This will handle the main logic of the programm
    try {
        const enemy_id = game.active_id === game.p1_id ? game.p2_id : game.p1_id;
        yield (0, gameHandler_1.move)(game, enemy_id, discover_id);
    }
    catch (err) {
        return res.status(400).json({
            message: "Error on move",
            error: err
        });
    }
}));
