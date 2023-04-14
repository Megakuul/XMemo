"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const db_1 = require("./models/db");
const auth_1 = require("./routes/auth");
const gameSocket_1 = require("./socket/gameSocket");
const play_1 = require("./routes/play");
const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();
// Connect the Mongoose Adapter and initializing the JWT Strategie
try {
    (0, db_1.connectMongoose)(mongoose, process.env.DB_AUTH_STRING);
    (0, passport_2.addJWTStrategie)(passport_1.default, process.env.JWT_SECRET_KEY);
}
catch (err) {
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
const app = express();
// Base HTTP Server to use REST API and Socket over the same HTTP Server
const server = http_1.default.createServer(app);
// Websocket for realtime data
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    path: "/gamesock"
});
// Initialize Express Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport_1.default.initialize());
// Initialize Routes and SocketHandlers
app.use('/auth', auth_1.AuthRouter);
app.use('/play', play_1.PlayRouter);
(0, gameSocket_1.setupGameSocket)(io);
// Start the HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
