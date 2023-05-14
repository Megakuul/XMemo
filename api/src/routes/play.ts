import express, {Router, Request, Response} from "express";
import passport from "passport";
import { Game } from "../models/game.js";
import { GameQueue, IGameQueue } from "../models/queue.js";
import { createGame, move } from "../game/gamehandler.js";

export const PlayRouter: Router = express.Router();

PlayRouter.post('/queue',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {

    if (!req.user || !req.user._id || !req.user.username) {
      return res.status(400).json({
        message: "Error adding player to queue",
        error: "Invalid user data"
      });
    }
    try {
      // Check if player was already in the queue -> remove the player from the queue
      if (await GameQueue.findOneAndDelete({ user_id: req.user._id })) {
        return res.status(200).json({
          message: "Removed player from the queue"
        });
      }

      // Add player to the queue
      await new GameQueue({
        user_id: req.user._id, 
        username: req.user.username,
        ranking: req.user.ranking,
        title: req.user.title,
      }).save();

      // Check if a Game can be created
      // TODO: here could be an algorithmus to find an optimal enemy for the player
      if (await GameQueue.countDocuments() >= 2) {
        const p1: IGameQueue | null = await GameQueue.findOneAndDelete();
        const p2: IGameQueue | null = await GameQueue.findOneAndDelete();
        await createGame(p1!, p2!, 20);
        // TODO: Maybe redirect user to the board
        return res.status(200).json({
          message: "Created Game",
        });
      }

      res.status(200).json({
        message: "Added player to the queue"
      });
    } catch (err) {
      res.status(500).json({
        message: "Error adding player to queue",
        error: err
      });
    }
  }
);

PlayRouter.get('/queue', async (req, res) => {
  try {
    const queue = await GameQueue.find({});
    res.status(200).json({
      message: "Successfully loaded queue",
      queue: queue
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to load queue",
      error: err
    });
  }
});

PlayRouter.post('/move',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {

    const gameid = req.query.gameid;
    const discover_id = req.body.discover_id;

    const game = await Game.findById(gameid);

    if (!game) {
      return res.status(404).json({
        message: "Error on move",
        error: `Game with id: ${gameid} not found`
      });
    }
    if (!req.user || (game.player1.id!=req.user._id && game.player2.id!=req.user._id)) {
      return res.status(403).json({
        message: "Error on move",
        error: "Spectators are not allowed to move"
      });
    }
    if (game.game_stage === -1) {
      return res.status(400).json({
        message: "Error on move",
        error: `Game has finished and is now readonly`
      });
    }
    if (game.active_id != req.user._id) {
      return res.status(403).json({
        message: "Error on move",
        error: `You are not allowed to move now`
      });
    }

    try {
      // This will lock the active_id to prevent a spamming attack
      // The active_id will be re-set in the move() function below
      const active_id_buf = game.active_id;
      game.active_id = "";
      await game.save();
      // Reset the active id
      game.active_id = active_id_buf;
      
      // This will handle the main logic of the programm
      const enemy_id = game.active_id===game.player1.id ? game.player2.id : game.player1.id;
      await move(game, enemy_id, discover_id);

      return res.status(200).json({
        message: "Successfully moved"
      });
    } catch (err: any) {
      if (game) {
        game.save();
      }
      return res.status(400).json({
        message: "Error on move",
        error: err.message
      });
    }
  }
);