import express, {Router, Request, Response} from "express";
import passport from "passport";
import { Game } from "../models/game.js";
import { GameQueue, IGameQueue } from "../models/queue.js";
import { createGame, finishGame, getTitle, move } from "../game/gamehandler.js";
import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Config } from "../models/config.js";

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

    const dbsess = await mongoose.startSession();

    try {
      // Check if player was already in the queue -> remove the player from the queue
      if (await GameQueue.findOneAndDelete({ user_id: req.user._id })) {
        return res.status(200).json({
          message: "Removed player from the queue"
        });
      }

      // Start transaction to update queue consistently
      dbsess.startTransaction();

      // Add player to the queue
      await new GameQueue({
        user_id: req.user._id, 
        username: req.user.username,
        ranking: req.user.ranking,
        title: req.user.title,
      }).save({ session: dbsess });

      // Check if a Game can be created
      if (await GameQueue.countDocuments({}, { session: dbsess }) >= 2) {
        const queueDoc1: IGameQueue | null = await GameQueue.findOneAndDelete({}, { session: dbsess });
        const queueDoc2: IGameQueue | null = await GameQueue.findOneAndDelete({}, { session: dbsess });

        // Fetch global config doc
        const config = await Config.findOne(
          { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // Create new game from the first two GameQueue entries
        const game = createGame(queueDoc1!, queueDoc2!, config!.rankedcardpairs, config!.rankedmovetime * 1000);
        await game.save({ session: dbsess });
        await dbsess.commitTransaction();
        await dbsess.endSession();

        return res.status(200).json({
          message: "Created Game",
        });
      } else {
        // Just add new queue entry
        await dbsess.commitTransaction();
        await dbsess.endSession();
      }

      return res.status(200).json({
        message: "Added player to the queue"
      });
    } catch (err) {
      return res.status(500).json({
        message: "Error adding player to queue",
        error: err
      });
    }
  }
);

PlayRouter.get('/queue', async (req, res) => {
  try {
    const queue = await GameQueue.find({}).lean();
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
    
    try {
      // Set active_id -> "" to lock the game
      // The game returned is in the state of before the update
      const game = await Game.findOneAndUpdate(
        { _id: gameid },
        { $set: { active_id: "" } },
        { new: false },
      );

      if (!game) {
        return res.status(404).json({
          message: "Error on move",
          error: `Game with id: ${gameid} not found`
        });
      }
      if (!req.user || (game.player1.id!=req.user._id && game.player2.id!=req.user._id)) {
        // Reset active_id (unlock game)
        await Game.findOneAndUpdate(
          { _id: gameid },
          { $set: { active_id: game.active_id } }
        );
        return res.status(403).json({
          message: "Error on move",
          error: "Spectators are not allowed to move"
        });
      }
      if (game.game_stage === -1) {
        // Reset active_id (unlock game)
        await Game.findOneAndUpdate(
          { _id: gameid },
          { $set: { active_id: game.active_id } }
        );
        return res.status(400).json({
          message: "Error on move",
          error: `Game has finished and is now readonly`
        });
      }
      if (game.active_id != req.user._id) {
        // Reset active_id (unlock game)
        await Game.findOneAndUpdate(
          { _id: gameid },
          { $set: { active_id: game.active_id } }
        );
        return res.status(403).json({
          message: "Error on move",
          error: `You are not allowed to move now`
        });
      }
      
      const enemy_id = game.active_id===game.player1.id ? game.player2.id : game.player1.id;
      // Handle game move logic
      move(game, enemy_id, discover_id);

      // If game is finished, call finishGame and update user ranks
      if (game.game_stage==-1) {
        // Fetch global config doc
        const config = await Config.findOne(
          { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // Handle game finish logic
        finishGame(game);

        // Create a transaction to ensure that results are all applied in one operation
        const dbsess = await mongoose.startSession();
        dbsess.startTransaction();

        // Update player1 ranking
        const player1 = await User.findByIdAndUpdate(game.player1.id, {
          $inc: {
            ranking: game.player1.rankupdate,
          },
        }, { session: dbsess, new: true });

        // Update player2 ranking
        const player2 = await User.findByIdAndUpdate(game.player1.id, {
          $inc: {
            ranking: game.player1.rankupdate
          }
        }, { session: dbsess, new: true });

        // Update player1 title
        if (config?.titlemap && player1?.ranking) {
          await User.findByIdAndUpdate(game.player1.id, {
            $set: {
              title: getTitle(player1.ranking, config.titlemap, "Beginner")
            }
          }, { session: dbsess });
        }
        // Update player2 title
        if (config?.titlemap && player2?.ranking) {
          await User.findByIdAndUpdate(game.player2.id, {
            $set: {
              title: getTitle(player2.ranking, config.titlemap, "Beginner")
            }
          }, { session: dbsess });
        }

        // Update game state
        await game.save({ session: dbsess });

        // Commit transaction
        await dbsess.commitTransaction();
        await dbsess.endSession();
      } else {
        // In regular moves, game state is just saved
        await game.save();
      }

      // Reset active_id (unlock game)
      await Game.findOneAndUpdate(
        { _id: gameid },
        { $set: { active_id: game.active_id } }
      );

      return res.status(200).json({
        message: "Successfully moved"
      });
    } catch (err: any) {
      return res.status(400).json({
        message: "Error on move",
        error: err.message
      });
    }
  }
);

PlayRouter.post('/takemove',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    const gameid = req.query.gameid;

    const dbsess = await mongoose.startSession();
    // Start transaction to mitigate risk of a race condition
    dbsess.startTransaction();

    const game = await Game.findOne({ _id: gameid }, {}, { session: dbsess });

    try {
      if (!game) {
        return res.status(404).json({
          message: "Error on takemove",
          error: `Game with id: ${gameid} not found`
        });
      }
      if (!req.user || (game.player1.id!=req.user._id && game.player2.id!=req.user._id)) {
        return res.status(403).json({
          message: "Error on takemove",
          error: "Spectators are not allowed to take moves"
        });
      }
      if (game.game_stage === -1) {
        return res.status(400).json({
          message: "Error on takemove",
          error: `Game has finished and is now readonly`
        });
      }
      if (req.user._id == game.active_id) {
        return res.status(400).json({
          message: "Error on takemove",
          error: `You cannot take your own move`
        });
      }

      if (new Date(game.nextmove) < new Date()) {
        game.active_id = req.user._id;
        game.game_stage = 1;
        game.nextmove = new Date(Date.now() + game.moveTimems).toUTCString();
        await game.save({ session: dbsess });
        await dbsess.commitTransaction();

        return res.status(200).json({
          message: "Move was taken successfully"
        });
      }
    } catch (err: any) {
      return res.status(400).json({
        message: "Error on takemove",
        error: err.message
      });
    } finally {
      await dbsess.endSession();
    }
  }
)