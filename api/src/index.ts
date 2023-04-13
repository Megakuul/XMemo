import {Application, Request, Response} from "express";
import http from "http";
import { Server } from "socket.io";
import passport, { PassportStatic } from "passport";
import { addJWTStrategie } from './config/passport';
import { connectMongoose } from "./models/db";
import { AuthRouter } from "./routes/auth";
import { setupGameSocket } from "./socket/gameSocket";
import { PlayRouter } from "./routes/play";

const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

// Connect the Mongoose Adapter and initializing the JWT Strategie
try {
  connectMongoose(mongoose, process.env.DB_AUTH_STRING)

  addJWTStrategie(passport, process.env.JWT_SECRET_KEY);
} catch (err) {
  console.error(err);
  process.exit(2);
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
