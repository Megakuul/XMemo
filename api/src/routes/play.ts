import {Router, Request, Response} from "express";
import jwt from 'jsonwebtoken';
import { User } from "../models/user";
import { Game } from "../models/game";
import { GameQueue } from "../models/queue";
import passport from "passport";

const express = require("express");

export const PlayRouter: Router = express.Router();

PlayRouter.post('/queue',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    try {
      await new GameQueue({
        user_id: req.user._id, username: req.user.username 
      }).save();

      // TODO: Check if the player is already in the queue
      if (await GameQueue.countDocuments() >= 2) {
        const p1: any = await GameQueue.findOneAndDelete();
        const p2: any = await GameQueue.findOneAndDelete();
        await startGame(p1.user_id, p2.user_id);
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

const startGame = async (p1_id: string, p2_id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const game = new Game({
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
    } catch (err) {
      reject(new Error(`Error creating game: ${err}`));
    }
  });
}