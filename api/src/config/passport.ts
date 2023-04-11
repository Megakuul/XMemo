import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { User } from '../models/user'; // Make sure to export the User model in the User.ts file

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

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
export const addJWTStrategie = (passport: PassportStatic, secret: string | undefined): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (secret===undefined) {
      reject(new Error("Error Injecting JWTStrategie: Failed to read JWTSecret"))
    } else {
      const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret,
      };
  
      passport.use(
        new JwtStrategy(opts, async (jwt_payload: JwtPayload, done) => {
          try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          } catch (err) {
            reject(new Error(`Error Injecting JWTStrategie: ${err}`))
          }
        })
      );
      resolve();
    }
  });
};

