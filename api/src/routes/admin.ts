import express, {Router, Response} from "express";
import passport from "passport";
import { User } from "../models/user";
import { ROLES } from "../auth/roles";
import { Config } from "../models/config";

export const AdminRouter: Router = express.Router();

AdminRouter.get('/config',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    const user: any = await User.findOne({ _id: req.user._id });
    if (user.role!=ROLES.ADMIN) {
        return res.status(403).json({
            message: "Error retrieving config",
            error: "User is not authorized for administrator access!"  
        })
    }

    const config = await Config.findOne(
        { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
        config: config,
    });
  }
);

AdminRouter.get('/config',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    const user: any = await User.findOne({ _id: req.user._id });
    if (user.role!=ROLES.ADMIN) {
        return res.status(403).json({
            message: "Error retrieving config",
            error: "User is not authorized for administrator access!"  
        })
    }

    const config = await Config.findOne(
        { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
        config: config,
    });
  }
);