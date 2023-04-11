"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const db_1 = require("./models/db");
const auth_1 = require("./routes/auth");
const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
dotenv.config();
try {
    (0, db_1.connectMongoose)(mongoose, process.env.DB_AUTH_STRING);
    (0, passport_2.addJWTStrategie)(passport_1.default, process.env.JWT_SECRET_KEY);
}
catch (err) {
    console.error(err);
    process.exit(2);
}
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport_1.default.initialize());
app.use('/api/auth', auth_1.AuthRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
