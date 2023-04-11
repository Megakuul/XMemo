"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJWTStrategie = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_jwt_2 = require("passport-jwt");
const user_1 = require("../models/user"); // Make sure to export the User model in the User.ts file
/**
 * Pass the PassportStatic Object by reference
 *
 * This will add the JwtStrategy with the specified secret key to the Passport Object
 *
 * ```javascript
 * const passport: PassportStatic = require('passport');
 *
 * require('./config/passport')(passport, process.env.JWT_SECRET_KEY);
 * ```
 */
const addJWTStrategie = (passport, secret) => {
    return new Promise((resolve, reject) => {
        if (secret === undefined) {
            reject(new Error("Error Injecting JWTStrategie: Failed to read JWTSecret"));
        }
        else {
            const opts = {
                jwtFromRequest: passport_jwt_2.ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: secret,
            };
            passport.use(new passport_jwt_1.Strategy(opts, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const user = yield user_1.User.findById(jwt_payload.id);
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false);
                }
                catch (err) {
                    reject(new Error(`Error Injecting JWTStrategie: ${err}`));
                }
            })));
            resolve();
        }
    });
};
exports.addJWTStrategie = addJWTStrategie;
