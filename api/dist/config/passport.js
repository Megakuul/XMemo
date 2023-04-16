import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { User } from '../models/user.js'; // Make sure to export the User model in the User.ts file
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
export const addJWTStrategie = async (passport, secret) => {
    if (secret === undefined) {
        throw new Error("Failed to read JWTSecret");
    }
    else {
        const opts = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        };
        passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await User.findById(jwt_payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            }
            catch (err) {
                throw new Error(err.message);
            }
        }));
    }
};
