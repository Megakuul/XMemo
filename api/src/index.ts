import express, {Application} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dotenvSafe from "dotenv-safe";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";
import { auth } from "express-openid-connect";
import ExpressSession from "express-session";
import { default as connectMongoDBSession } from "connect-mongodb-session";
import { addJWTStrategie } from './auth/passport.js';
import { connectMongoose } from "./models/db.js";
import { AuthRouter } from "./routes/auth.js";
import { setupPublicSocket } from "./socket/PublicSocket.js";
import { setupAuthSocket } from "./socket/AuthSocket.js";
import { PlayRouter } from "./routes/play.js";
import { IUser, User } from "./models/user.js";
import { ROLES } from "./auth/roles.js";
import { AdminRouter } from "./routes/admin.js";
import { LogErr, LogInfo } from "./logger/logger.js";

// Load environment variables from .env
dotenv.config();

// Check environment variables
try {
  dotenvSafe.config();
} catch (err: any) {
  const missingVars = err.missing.join(", ");
  LogErr(`Error: Following Environment variables were missing: ${missingVars}`);
  process.exit(1);
}

// Connect the Mongoose Adapter
try {
  await connectMongoose(mongoose, process.env.DB_AUTH_STRING);
} catch (err: any) {
  LogErr(`Error connecting mongodb database: ${err.message}`);
  process.exit(1);
}

// Create administrator if not existent
try {
  // Check if one user with ADMIN Role exists
  const admin: IUser | null = await User.findOne({ role: ROLES.ADMIN });
  if (!admin) {
    // If no user with ADMIN Role exists, create the default admin account
    new User({
      username: process.env.DEFAULT_ADMIN_USERNAME || "admin",
      password: process.env.DEFAULT_ADMIN_PASSWORD || "password",
      email: process.env.DEFAULT_ADMIN_EMAIL || "admin@xmemo",
      role: ROLES.ADMIN
    }).save();
  }
} catch (err: any) {
  LogErr(`Error creating administrator account: ${err.message}`)
  process.exit(1);
}

// Initializing the JWT Strategie
try {
  await addJWTStrategie(passport, process.env.JWT_SECRET_KEY);
} catch (err: any) {
  LogErr(`Error Injecting JWTStrategie: ${err.message}`)
  process.exit(1);
}

// CORS options
// TODO: Set the origin to a Env variable
// If the API shouldn't be public available change the origin
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Express RESTful API
const app: Application = express();
// Base HTTP Server to use REST API and Socket over the same HTTP Server
const server = http.createServer(app);
// Websocket for realtime data
const publicSocket = new Server(server, {
  cors: corsOptions,
  path: "/api/publicsock"
});

const authSocket = new Server(server, {
  cors: corsOptions,
  path: "/api/authsock"
});

// Initialize stateless Express Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
// Initializing express mongo store 
// -> this is required to manage oidc sessions on the database
// -> otherwise things like refresh-tokens are stored locally, which doesn't scale horizontally
try {
  if (process.env.EXPRESS_DB_SESSION_ENABLE) {
    const MongoDBStore = connectMongoDBSession(ExpressSession);
    // Create mongodb store
    const store = new MongoDBStore({
      uri: process.env.DB_AUTH_STRING!,
      collection: "express_sessions"
    });
    // Create and initialize express session with the created session
    app.use(ExpressSession({
      secret: process.env.EXPRESS_DB_SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: store,
    }));
  }
} catch (err: any) {
  LogErr(`Error initalizing Express Session Store: ${err.message}`)
  process.exit(1);
}
// Initializing the oidc middleware
try {
  if (process.env.OIDC_ENABLED) {
    app.use(auth({
      authRequired: false,
      auth0Logout: false,
      secret: process.env.OIDC_SECRET,
      baseURL: process.env.OIDC_BASEURL,
      clientID: process.env.OIDC_CLIENTID,
      issuerBaseURL: process.env.OIDC_ISSUERBASEURL,
    }));
  }
} catch (err: any) {
  LogErr(`Error initalizing OIDC middleware: ${err.message}`)
  process.exit(1);
}

// Initialize Routes and SocketHandlers
app.use('/api/auth', AuthRouter);
app.use('/api/play', PlayRouter);
app.use('/api/admin', AdminRouter);
setupPublicSocket(publicSocket);
setupAuthSocket(authSocket, process.env.JWT_SECRET_KEY);

// Start the HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  LogInfo(`Server is running on port ${PORT}`);
});
