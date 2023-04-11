"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const express = require("express");
exports.AuthRouter = express.Router();
exports.AuthRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = new user_1.User({ username, password });
    try {
        yield user.save();
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (err) {
        res.status(400).json({ message: 'Error registering user', error: err });
    }
}));
exports.AuthRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield user_1.User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (!(yield user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const payload = {
            id: user._id,
            username: user.username,
        };
        if (process.env.JWT_SECRET_KEY === undefined) {
            res.json({
                message: "Error logging in",
                error: "Cannot find JWT on the server, contact an administrator"
            });
        }
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        res.json({
            message: "Logged in successfully",
            token: `Bearer ${token}`
        });
    }
    catch (err) {
        res.status(400).json({
            message: "Error logging in",
            error: err
        });
    }
}));
exports.AuthRouter.get('/profile', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ username: req.user.username });
});
