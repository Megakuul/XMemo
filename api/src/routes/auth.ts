import express, {Router, Response} from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { IUser, User } from "../models/user.js";
import { LogWarn } from "../logger/logger.js";

export const AuthRouter: Router = express.Router();

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email.toLowerCase());
}

AuthRouter.post('/register', async (req, res) => {
  try {
    // Initialize parameters
    const { username, email, password } = req.body;

    // Sanitize inserted parameters
    if (!email || !username || !password) {
      return res.status(400).json({
        message: "Error registering user",
        error: "Username, Email and Password is required"
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Error registering user",
        error: "Email has invalid format"
      });
    }
    if (username.length > 15) {
      return res.status(405).json({
        message: "Error registering user",
        error: "Make sure the username is no longer than 15 characters"
      });
    }
    if (password.length < 8 || password.length > 32) {
      return res.status(405).json({
        message: "Error registering user",
        error: "Make sure the password is between 8 and 32 characters long"
      });
    }

    // Create User object
    const user: IUser | null = new User({
      username: username,
      email: email,
      password: password,
    });

    // Write User object to database
    await user.save();

    res.status(201).json({ 
      message: "User registered successfully" 
    });
  } catch (err) {
    LogWarn(String(err), "/auth/register");
    return res.status(500).json({
      message: 'Error registering user', 
      error: "Internal error occured" 
    });
  }
});

AuthRouter.post('/login', async (req, res) => {
  try {
    // Initialize parameters
    const { username, password } = req.body;

    // Check if the user exists
    const user: IUser | null = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Error logging in", error: "User not found" });
    }
    // Check if password matches
    if (!await user.comparePassword(password)) {
      return res.status(400).json({ message: "Error logging in", error: "Invalid password" });
    }
    // Create token payload
    const payload = {
      id: user._id,
      username: user.username,
    };

    if (process.env.JWT_SECRET_KEY===undefined) {
      LogWarn("Cannot find JWT on the server, contact an administrator", "/auth/login");
      return res.status(500).json({
        message: "Error logging in",
        error: "Cannot find JWT on the server, contact an administrator"
      });
    }

    // Sign token and return it to the user
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: '7d' });
    res.status(200).json({ 
      message: "Logged in successfully",
      token: `Bearer ${token}`
    });
  } catch (err) {
    LogWarn(String(err), "/auth/login");
    return res.status(500).json({
      message: 'Error logging in', 
      error: "Internal error occured" 
    });
  }
});

AuthRouter.post('/editprofile', 
  passport.authenticate('jwt', { session: false }), 
  async (req: any, res: Response) => {
    try {
      // Initialize parameters
      const { newusername, newdescription, newdisplayedgames } = req.body;
      const newdisplayedgamesNum = Number(newdisplayedgames);
      
      // Sanitize updated parameters
      if (!newusername && !newdescription && !newdisplayedgames) {
        return res.status(400).json({
          message: "Error updating user",
          error: "At least one field (username or password) is required" 
        });
      }
      if (newusername.length > 15) {
        return res.status(405).json({
          message: "Error updating user",
          error: "Make sure the username is no longer than 15 characters"
        });
      } else if (newdescription.length > 25) {
        return res.status(405).json({
          message: "Error updating user",
          error: "Make sure the description is no longer than 25 characters"
        });
      } else if (newdisplayedgames && 
        (Number.isNaN(newdisplayedgamesNum) || newdisplayedgamesNum > 100 || newdisplayedgamesNum < 1)) {
        return res.status(405).json({
          message: "Error updating user",
          error: "Displayed games must be specified as number not higher than 100"
        });
      }

      // Fetch User object
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (!user) {
        return res.status(404).json({
          message: "Error updating user",
          error: "User does not exist"
        });
      }

      // Apply updated parameters to User object
      if (newusername)
        user.username = newusername;
      if (newdescription)
        user.description = newdescription;
      if (newdisplayedgames)
        user.displayedgames = newdisplayedgamesNum;

      // Write User object to database
      await user.save();
      res.status(200).json({
        message: "User updated successfully"
      })
    } catch (err) {
      LogWarn(String(err), "/auth/editprofile");
      return res.status(500).json({
        message: 'Error updating user', 
        error: "Internal error occured" 
      });
    }
  }
);

AuthRouter.post('/editpassword',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    try {
      // Initialize parameters
      const { oldpassword, newpassword } = req.body;

      // Sanitize updated parameters
      if (!newpassword || !oldpassword) {
        return res.status(400).json({ message: "Error changing password", error: "Old and New Password is required" })
      }
      if (newpassword.length < 8 || newpassword.length > 32) {
        return res.status(405).json({
          message: "Error changing password",
          error: "New password needs to be between 8 and 32 characters long."
        });
      }
      if (!await req.user.comparePassword(oldpassword)) {
        return res.status(400).json({ message: "Error changing password", error: "Invalid password" });
      }
      
      // Fetch User object
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (!user) {
        return res.status(404).json({
          message: "Error changing password",
          error: "User not found"
        });
      }

      // Apply updated parameters to User object
      user.password = newpassword;

      // Write User object to database
      await user.save();
      res.status(200).json({
        message: "Password changed successfully"
      });
    } catch (err) {
      LogWarn(String(err), "/auth/editpassword");
      return res.status(500).json({
        message: 'Error changing password', 
        error: "Internal error occured" 
      });
    }
  }
);
      
AuthRouter.get('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    res.status(200).json({
      username: req.user.username,
      userid: req.user._id,
      email: req.user.email,
      description: req.user.description,
      title: req.user.title,
      ranking: req.user.ranking,
      displayedgames: req.user.displayedgames,
      role: req.user.role
    });
  }
);