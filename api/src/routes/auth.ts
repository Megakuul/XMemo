import express, {Router, Response} from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { IUser, User } from "../models/user.js";
import { LogWarn } from "../logger/logger.js";
import oidcPkg from "express-openid-connect";
import crypto from "crypto";
const { requiresAuth } = oidcPkg;
import { checkOIDCAvailability } from "../auth/oidc.js";

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
      external: false,
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
    // Check if user is local user
    if (user.external) {
      return res.status(403).json({ message: "Error logging in", error: "External user cannot log in with local credentials" })
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

    // Get jwt experation
    const expiration = Number(process.env.REST_JWT_EXPIRATION_DAYS!)

    // Sign token and return it to the user as cookie
    const token = jwt.sign(payload, process.env.REST_JWT_SECRET_KEY!, { expiresIn: expiration * (24 * 60 * 60) });
    res.cookie("auth", `${token}`, {
      httpOnly: true,
      maxAge: expiration * (24 * 60 * 60 * 1000)
    });
    // Return successful status to user
    return res.status(200).json({
      message: "Logged in successfully"
    });
  } catch (err) {
    LogWarn(String(err), "/auth/login");
    return res.status(500).json({
      message: 'Error logging in', 
      error: "Internal error occured" 
    });
  }
});

AuthRouter.get('/oidc/login', checkOIDCAvailability, requiresAuth(), async (req, res) => {
  // Route to redirect user after
  const redirect = process.env.OIDC_FRONTEND_REDIRECT_ROUTE ?? "/";
  try {
    // Check if authentication succeeded
    if (!req.oidc.isAuthenticated()) {
      return res.redirect(`${redirect}?error=Failed to authenticate with OIDC provider`);
    }

    // Check if required tokenClaim values are present
    if (!req.oidc.idTokenClaims?.sub ||
       !req.oidc.idTokenClaims?.email) {
      return res.redirect(`${redirect}?error=Expected tokenClaims 'sub' and 'email' are missing on providers ID Token!`);
    }

    // External_id is set to the "sub" tokenClaim, which is essentially the unique ID on the provider
    const external_id = req.oidc.idTokenClaims.sub;
    
    // JWT payload object
    let payload = {};
    // Error string
    let error = "";

    // Check if the user exists
    const user: IUser | null = await User.findOne({ external_id: external_id });
    if (user) {
      // If user already exists, create jwt payload and update mail attribute
      if (req.oidc.idTokenClaims.email) {
        user.email = req.oidc.idTokenClaims.email;
        try {
          // In case the mail is already in use or there is another failure
          // the mail is just kept on the old one, but the user is notified
          await user.save();
        } catch (err: any) {
          error = "Failed to update email address";
        }
      }
      // Creating jwt payload
      payload = {
        id: user._id,
        username: user.username,
      }
    } else {
      // If user does not exist, create a new one
      // Because the nickname is usually not unique on the provider, while the xmemo username is unique, the username is set to a random string
      // Passwort cannot be used and is set to a random string
      // Mail address must be unique so it is set to the tokenClaim mail, if the mail already exists, registration fails and the user is notified
      const newuser: IUser | null = new User({
        username: crypto.randomBytes(12).toString('hex'),
        external: true,
        external_id: external_id,
        email: req.oidc.idTokenClaims.email,
        password: crypto.randomBytes(128).toString('hex'),
      });
      
      try {
        // In case the mail is already in use or there is another failure
        // the user is not created and the user is notified immediatly
        await newuser.save();
      } catch (err: any) {
        error = err.message;
        return res.redirect(`${redirect}?error=${error}`);
      }
      // Forming jwt payload
      payload = {
        id: newuser._id,
        username: newuser.username,
      }
    }

    // Get jwt experation
    const expiration = Number(process.env.REST_JWT_EXPIRATION_DAYS!)

    // Sign token and return it to the user as cookie
    const token = jwt.sign(payload, process.env.REST_JWT_SECRET_KEY!, { expiresIn: expiration * (24 * 60 * 60) });
    res.cookie("auth", `${token}`, {
      httpOnly: true,
      maxAge: expiration * (24 * 60 * 60 * 1000)
    });
    // Redirect user back to /profile
    return res.redirect(redirect);
  } catch (err) {
    LogWarn(String(err), "/auth/oidc/login");
    return res.redirect(`${redirect}?error=Internal error occured`);
  }
});

AuthRouter.get('/profile',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    res.status(200).json({
      username: req.user.username,
      userid: req.user._id,
      external: req.user.external,
      email: req.user.email,
      description: req.user.description,
      title: req.user.title,
      ranking: req.user.ranking,
      displayedgames: req.user.displayedgames,
      role: req.user.role
    });
  }
);

AuthRouter.get('/getsockettoken',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    try {
      // Token is created without database access directly from the original jwt
      const payload = {
        id: req.user._id,
        username: req.user.username,
      }
      // Get jwt experation
      const expiration = Number(process.env.SOCKET_JWT_EXPIRATION_DAYS!);
      // Sign token with the socket jwt secret
      const token = jwt.sign(payload, process.env.SOCKET_JWT_SECRET_KEY!, { expiresIn: expiration * (24 * 60 * 60) });
      // Send token to client
      return res.status(200).json({
        token: token,
      });
    } catch (err) {
      LogWarn(String(err), "/auth/getsockettoken");
      return res.status(500).json({
        message: 'Error updating user', 
        error: "Internal error occured" 
      });
    }
  }
);

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
      if (user.external) {
        return res.status(403).json({
          message: "Error changing password",
          error: "Password cannot be changed on external user"
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

AuthRouter.get('/logout', async (req, res) => {
  res.clearCookie("auth", {
    httpOnly: true
  });

  res.status(200).json({
    message: "Logged out successfully"
  });
});