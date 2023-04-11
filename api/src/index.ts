import {Application, Request, Response} from "express";
import passport, { PassportStatic } from "passport";
import { addJWTStrategie } from './config/passport';
import { connectMongoose } from "./models/db";
import { AuthRouter } from "./routes/auth";

const express = require('express');
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();

try {
  connectMongoose(mongoose, process.env.DB_AUTH_STRING)

  addJWTStrategie(passport, process.env.JWT_SECRET_KEY);
} catch (err) {
  console.error(err);
  process.exit(2);
}

const app: Application = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/api/auth', AuthRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
