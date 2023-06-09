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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBoardHandler = void 0;
const game_1 = require("../models/game");
const setupBoardHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("subscribe", (gameId) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Subscribing to game ${gameId}`);
            try {
                const game = yield game_1.Game.findById(gameId);
                if (!game) {
                    throw new Error("Game not found");
                }
                const pipeline = [
                    {
                        $match: {
                            "documentKey._id": game._id,
                        },
                    },
                ];
                const changeStream = game_1.Game.watch(pipeline);
                changeStream.on("change", (change) => {
                    console.log("Change detected:", change);
                    socket.emit("gameUpdate", change);
                });
                socket.on("disconnect", () => {
                    console.log("Client disconnected:", socket.id);
                    changeStream.close();
                });
            }
            catch (err) {
                console.error("Error subscribing to game:", err);
                socket.emit("subscriptionError", err.message);
            }
        }));
    });
};
exports.setupBoardHandler = setupBoardHandler;
