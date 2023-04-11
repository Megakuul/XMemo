import {Router, Request, Response} from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { User } from "../models/user";

const express = require("express");

export const AuthRouter: Router = express.Router();

AuthRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err });
  }
});

AuthRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!await user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const payload = {
      id: user._id,
      username: user.username,
    };

    if (process.env.JWT_SECRET_KEY===undefined) {
      res.json({
        message: "Error logging in",
        error: "Cannot find JWT on the server, contact an administrator"
      });
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: '7d' });
    res.json({ 
      message: "Logged in successfully",
      token: `Bearer ${token}`
    });
  } catch (err) {
    res.status(400).json({
      message: "Error logging in",
      error: err 
    });
  }
});
      
AuthRouter.get('/profile',
  passport.authenticate('jwt', { session: false }),
  (req: any, res: Response) => {
    res.json({ username: req.user.username });
  }
);