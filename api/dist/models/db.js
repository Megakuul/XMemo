"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongoose = void 0;
const mongoose_1 = require("mongoose");
const connectMongoose = (mongoose, uri) => {
    return new Promise((resolve, reject) => {
        if (uri === undefined) {
            reject(new mongoose_1.Error("Error connecting to MongoDB: Failed to read uri"));
        }
        else {
            mongoose.connect(uri);
            mongoose.connection.on('connected', () => {
                resolve();
            });
            mongoose.connection.on('error', (err) => {
                reject(new mongoose_1.Error(`Error connecting to MongoDB: ${err}`));
            });
        }
    });
};
exports.connectMongoose = connectMongoose;
