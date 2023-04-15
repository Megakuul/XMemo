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
const isValidEmail = (email) => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email.toLowerCase());
};
exports.AuthRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, description, password } = req.body;
    const basetitle = "Beginner";
    if (!email || !username || !password) {
        return res.status(404).json({
            message: "Error registering user",
            error: "Username, Email and Password is required"
        });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Error registering user",
            error: "Email has invalid format"
        });
    }
    try {
        const user = new user_1.User({
            username: username,
            email: email,
            password: password,
            description: description,
            title: basetitle,
            ranking: 0
        });
        yield user.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error registering user", error: err });
    }
}));
exports.AuthRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield user_1.User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!(yield user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const payload = {
            id: user._id,
            username: user.username,
        };
        if (process.env.JWT_SECRET_KEY === undefined) {
            return res.status(500).json({
                message: "Error logging in",
                error: "Cannot find JWT on the server, contact an administrator"
            });
        }
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        res.status(200).json({
            message: "Logged in successfully",
            token: `Bearer ${token}`
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error logging in",
            error: err
        });
    }
}));
exports.AuthRouter.post('/editprofile', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newusername, newdescription } = req.body;
    if (!newusername && !newdescription) {
        return res.status(400).json({
            message: "At least one field (username or password) is required"
        });
    }
    const user = yield user_1.User.findOne({ _id: req.user._id });
    if (newusername) {
        user.username = newusername;
    }
    if (newdescription) {
        user.description = newdescription;
    }
    try {
        yield user.save();
        res.status(200).json({
            message: "User updated successfully"
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err });
    }
}));
exports.AuthRouter.post('/editpassword', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldpassword, newpassword } = req.body;
    if (!newpassword || !oldpassword) {
        return res.status(400).json({ message: "Error changing password", error: "Old and New Password is required" });
    }
    if (!(yield req.user.comparePassword(oldpassword))) {
        return res.status(400).json({ message: "Error changing password", error: "Invalid password" });
    }
    try {
        const user = yield user_1.User.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).json({
                message: "Error changing password",
                error: "User not found"
            });
        }
        user.password = newpassword;
        yield user.save();
        res.status(200).json({
            message: "Password changed successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error changing password",
            error: err
        });
    }
}));
exports.AuthRouter.get('/profile', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        username: req.user.username,
        description: req.user.description,
        title: req.user.title,
        ranking: req.user.ranking
    });
}));
