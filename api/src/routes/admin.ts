import express, {Router, Response} from "express";
import passport from "passport";
import { IUser, User } from "../models/user.js";
import { ROLES, RoleFromString } from "../auth/roles.js";
import { GetConfig, GetRawConfig } from "../models/config.js";
import { LogWarn } from "../logger/logger.js";

export const AdminRouter: Router = express.Router();

AdminRouter.get('/config',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    try {
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (user?.role!=ROLES.ADMIN&&user?.role!=ROLES.MAINTAINER) {
        return res.status(403).json({
            message: "Error retrieving config",
            error: "User is not authorized for maintainance access!"  
        })
      }

      const config = await GetRawConfig();

      return res.status(200).json({
        config: config,
      });
    } catch (err) {
      LogWarn(String(err));
      return res.status(500).json({
        message: 'Error retrieving config', 
        error: "Internal error occured" 
      });
    }
  }
);

AdminRouter.post('/editconfig',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    try {
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (user?.role!=ROLES.ADMIN&&user?.role!=ROLES.MAINTAINER) {
        return res.status(403).json({
            message: "Error editing config",
            error: "User is not authorized for maintainance access!"  
        })
      }
    
      const { newrankedcardpairs, newrankedmovetime, newtitlemap } = req.body;
    
      const newrankedcardpairsNum = Number(newrankedcardpairs);
      const newrankedmovetimeNum = Number(newrankedmovetime);
      let newtitlemapMap: Map<number, string> | undefined;
      
      if (!newrankedcardpairs &&
          !newrankedmovetime &&
          !newtitlemap) {
        return res.status(400).json({
          message: "Error editing config",
          error: "At least one field is required" 
        });
      }

      if (newrankedcardpairs && 
      (Number.isNaN(newrankedcardpairsNum) || newrankedcardpairsNum > 400 || newrankedcardpairsNum < 1)) {
        return res.status(405).json({
          message: "Error editing config",
          error: "Card pairs in ranked mode can not exceed 400"
        });
      }
      if (newrankedmovetime && 
      (Number.isNaN(newrankedmovetimeNum) || newrankedmovetimeNum > 1000 || newrankedmovetimeNum < 1)) {
        return res.status(405).json({
          message: "Error editing config",
          error: "Move time should be under 1000 seconds"
        });
      }
      try {
        if (newtitlemap) {
          newtitlemapMap = new Map<number, string>(Object.entries(
            // Parse json
            JSON.parse(newtitlemap))
            .map(([key, value]): [number, string] => {
              // Convert keys to Numbers
              return [Number(key), String(value)]
            })
          );
        }
      } catch (err) {
        return res.status(405).json({
          message: "Error editing config",
          error: `Cannot parse titlemap: ${err}`
        });
      }

      const config = await GetConfig();

      if (!Number.isNaN(newrankedcardpairsNum)) {
        config!.rankedcardpairs = newrankedcardpairsNum;
      }

      if (!Number.isNaN(newrankedmovetimeNum)) {
        config!.rankedmovetime = newrankedmovetimeNum;
      }

      if (newtitlemapMap) {
        config!.titlemap = newtitlemapMap;
      }

      await config!.save();

      return res.status(200).json({
        message: "Successfully updated config"
      });
    } catch (err) {
      LogWarn(String(err));
      return res.status(500).json({
        message: 'Error editing config', 
        error: "Internal error occured" 
      });
    }
  }
);

AdminRouter.get('/user',
  passport.authenticate('jwt', { session: false }), 
  async (req: any, res: Response) => {
    try {
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (user?.role!=ROLES.ADMIN) {
        return res.status(403).json({
          message: "Error retrieving user information",
          error: "User is not authorized for administrator access!"  
        });
      }

      const { username } = req.body;

      const searchedUser: IUser | null = await User.findOne({ username: username });
      if (!searchedUser) {
        return res.status(404).json({
          message: "Error retrieving user information",
          error: "User does not exist"  
        });
      }

      return res.status(200).json({
        user: {
          userid: searchedUser._id,
          username: searchedUser.username,
          email: searchedUser.email,
          ranking: searchedUser.ranking,
          role: searchedUser.role
        }
      });
    } catch (err) {
      LogWarn(String(err));
      return res.status(500).json({
        message: 'Error retrieving user information', 
        error: "Internal error occured" 
      });
    }
});

AdminRouter.post('/edituser',
  passport.authenticate('jwt', { session: false }), 
  async (req: any, res: Response) => {
    try {
      const user: IUser | null = await User.findOne({ _id: req.user._id });
      if (user?.role!=ROLES.ADMIN) {
        return res.status(403).json({
          message: "Error updating user",
          error: "User is not authorized for administrator access!"  
        });
      }

      const { userid, newrole } = req.body;
      
      if (!newrole) {
        return res.status(400).json({
          message: "Error updating user",
          error: "At least one field is required" 
        });
      }

      const newroleRole = RoleFromString(newrole);
      if (newrole && !newroleRole) {
        return res.status(404).json({
          message: "Error updating user",
          error: "Role does not exist"
        });
      }

      const searchedUser: IUser | null = await User.findOne({ _id: userid });
      if (!searchedUser) {
        return res.status(404).json({
          message: "Error updating user",
          error: "User does not exist"
        });
      }

      if (newrole) {
        searchedUser.role = newroleRole!;
      }

      await searchedUser.save();

      return res.status(200).json({
        message: "Successfully updated user"
      });
    } catch (err) {
      LogWarn(String(err));
      return res.status(500).json({
        message: 'Error updating user', 
        error: "Internal error occured" 
      });
    }
});