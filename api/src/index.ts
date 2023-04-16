import express, {Application, Request, Response} from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import passport, { PassportStatic } from "passport";
import { addJWTStrategie } from './config/passport.js';
import { connectMongoose } from "./models/db.js";
import { AuthRouter } from "./routes/auth.js";
import { setupGameSocket } from "./socket/gameSocket.js";
import { PlayRouter } from "./routes/play.js";

dotenv.config();

// Connect the Mongoose Adapter
try {
  await connectMongoose(mongoose, process.env.DB_AUTH_STRING);
} catch (err: any) {
  console.error(`Error connecting mongodb database: ${err.message}`);
  process.exit(2);
}

// Initializing the JWT Strategie
try {
  await addJWTStrategie(passport, process.env.JWT_SECRET_KEY);
} catch (err: any) {
  console.error(`Error Injecting JWTStrategie: ${err.message}`);
  process.exit(3);
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
const io = new Server(server, {
  cors: corsOptions,
  path: "/gamesock"
});

// Initialize Express Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Initialize Routes and SocketHandlers
app.use('/auth', AuthRouter);
app.use('/play', PlayRouter);
setupGameSocket(io);

// Start the HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
