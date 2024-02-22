import express, {Application} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dotenvSafe from "dotenv-safe";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import passport from "passport";
import { auth } from "express-openid-connect";
import ExpressSession from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import { addJWTStrategy } from './auth/passport.js';
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
  // Check if all variables are present
  dotenvSafe.config({
    allowEmptyValues: true,
  });
  // Set 'false' and 'no' to "" which is actually considered 'falsy'
  for (const [k, v] of Object.entries(process.env)) {
    if (v && 
      (v.toLowerCase() === "false" ||
       v.toLowerCase() === "no")) {
      process.env[k] = "";
    }
  }
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
  await addJWTStrategy(passport, process.env.REST_JWT_SECRET_KEY);
} catch (err: any) {
  LogErr(`Error Injecting JWTStrategie: ${err.message}`)
  process.exit(1);
}


// CORS options for REST Server + Websocket handshake server
// If the ALLOWED_CORS_ORIGIN is not set, set options to undefined
// this will enforce the default http server behavior, which is basically to only allow sameOrigin requests
const corsOptions = process.env.ALLOWED_CORS_ORIGIN ? {
  origin: process.env.ALLOWED_CORS_ORIGIN, // Access-Control-Allow-Origin Header
  credentials: true, // Access-Control-Allow-Credentials Header
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
} : undefined;

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
app.use(cookieParser());
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
setupAuthSocket(authSocket, process.env.SOCKET_JWT_SECRET_KEY);

// Start the HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  LogInfo(`Server is running on port ${PORT}`);
});
