import express from "express";
import passport from "passport";
import { Game } from "../models/game.js";
import { GameQueue } from "../models/queue.js";
import { createGame, move } from "../game/gamehandler.js";
export const PlayRouter = express.Router();
PlayRouter.post('/queue', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Check if player was already in the queue -> remove the player from the queue
        if (await GameQueue.findOneAndDelete({ user_id: req.user._id })) {
            return res.status(200).json({
                message: "Successfully removed player from the queue"
            });
        }
        // Add player to the queue
        await new GameQueue({
            user_id: req.user._id, username: req.user.username
        }).save();
        // Check if a Game can be created
        // TODO: here could be an algorithmus to find an optimal enemy for the player
        if (await GameQueue.countDocuments() >= 2) {
            const p1 = await GameQueue.findOneAndDelete();
            const p2 = await GameQueue.findOneAndDelete();
            await createGame(p1.user_id, p2.user_id, p1.username, p2.username, 20);
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
});
PlayRouter.get('/queue', async (req, res) => {
    try {
        const queue = await GameQueue.find({});
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
});
PlayRouter.post('/move', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const gameid = req.query.gameid;
        const discover_id = req.body.discover_id;
        const game = await Game.findById(gameid);
        if (!game) {
            return res.status(404).json({
                message: "Error on move",
                error: `Game with id: ${gameid} not found`
            });
        }
        if (game.active_id !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Error on move",
                error: `You are not allowed to move now`
            });
        }
        // This will lock the active_id to prevent a spamming attack
        // The active_id will be re-set in the move() function below
        if (!await Game.findOneAndUpdate({ _id: gameid }, { $set: { active_id: undefined }, })) {
            return res.status(500).json({
                message: "Error on move",
                error: "Failed to update the game"
            });
        }
        // This will handle the main logic of the programm
        const enemy_id = game.active_id === game.p1_id ? game.p2_id : game.p1_id;
        await move(game, enemy_id, discover_id);
        return res.status(200).json({
            message: "Successfully moved"
        });
    }
    catch (err) {
        return res.status(400).json({
            message: "Error on move",
            error: err.message
        });
    }
});
