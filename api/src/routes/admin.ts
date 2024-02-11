import express, {Router, Response} from "express";
import passport from "passport";
import { User } from "../models/user.js";
import { ROLES } from "../auth/roles.js";
import { Config } from "../models/config.js";

export const AdminRouter: Router = express.Router();

AdminRouter.get('/config',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    const user: any = await User.findOne({ _id: req.user._id });
    if (user.role!=ROLES.ADMIN&&user.role!=ROLES.MAINTAINER) {
        return res.status(403).json({
            message: "Error retrieving config",
            error: "User is not authorized for maintainance access!"  
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

AdminRouter.post('/editconfig',
  passport.authenticate('jwt', { session: false }),
  async (req: any, res: Response) => {
    const user: any = await User.findOne({ _id: req.user._id });
    if (user.role!=ROLES.ADMIN&&user.role!=ROLES.MAINTAINER) {
        return res.status(403).json({
            message: "Error editing config",
            error: "User is not authorized for maintainance access!"  
        })
    }

    const { newrankedcardpairs, newrankedmovetime, newtitlemap } = req.body;

    const newrankedcardpairsNum = Number(newrankedcardpairs);
    const newrankedmovetimeNum = Number(newrankedmovetime);
    let newtitlemapMap: Map<number, string>;
    
    if (!newrankedcardpairs &&
        !newrankedmovetime &&
        !newtitlemap) {
      return res.status(400).json({
        message: "Error editing config",
        error: "At least one field is required" 
      });
    }

    try {
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

        const config = await Config.findOne(
            { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        if (newrankedcardpairs) {
            config!.rankedcardpairs = newrankedcardpairs;
        }

        if (newrankedmovetime) {
            config!.rankedmovetime = newrankedmovetime;
        }

        if (newtitlemap) {
            config!.titlemap = newtitlemap;
        }

        await config!.save();

        return res.status(200).json({
            message: "Successfully updated config"
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error editing config', 
            error: err 
        });
    }
  }
);

// TODO: Implement administration functions to manipulate users