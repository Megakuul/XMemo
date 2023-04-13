import {Router, Request, Response} from "express";
import jwt from 'jsonwebtoken';
import passport from "passport";
import { User } from "../models/user";
import { Game } from "../models/game";
import { GameQueue } from "../models/queue";
import { createGame } from "../game/gamehandler";

const express = require("express");

export const PlayRouter: Router = express.Router();

PlayRouter.post('/queue',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
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
        const p1: any = await GameQueue.findOneAndDelete();
        const p2: any = await GameQueue.findOneAndDelete();
        await createGame(p1.user_id, p2.user_id, p1.username, p2.username, 20);
        // TODO: Maybe redirect user to the board
        return res.status(200).json({
          message: "Successfully created game",
        });
      }

      res.status(200).json({
        message: "Successfully added player to the queue"
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