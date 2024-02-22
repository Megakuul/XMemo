import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { User } from '../models/user.js'; // Make sure to export the User model in the User.ts file

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

/**
 * Pass the PassportStatic Object by reference
 * 
 * This will add the JwtStrategy with the specified secret key to the Passport Object
 */
export const addJWTStrategy = async (passport: PassportStatic, secret: string | undefined): Promise<void> => {
  if (secret===undefined) {
    throw new Error("Failed to read JWTSecret");
  } else {
    const opts = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Allow token from Authorization Header (for external API calls)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Allow token from httpOnly "auth" token (for end user browser API calls)
        (request) => {
          const token = request.cookies.auth;
          return token;
        }
      ]),
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
        } catch (err: any) {
          throw new Error(err.message);
        }
      })
    );
  }
};

