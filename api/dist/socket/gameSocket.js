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
exports.setupGameSocket = void 0;
const game_1 = require("../models/game");
const setupGameSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("subscribe", (gameId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const game = yield game_1.Game.findById(gameId);
                if (!game) {
                    socket.emit("subscriptionError", `Failed to connect to game: ${gameId}. Closing socket...`);
                    socket.disconnect();
                }
                const pipe = [
                    {
                        $match: {
                            "documentKey._id": game._id,
                        },
                    },
                ];
                const changeStream = game_1.Game.watch(pipe);
                changeStream.on("change", (change) => {
                    socket.emit("gameUpdate", change);
                });
                socket.on("disconnect", () => {
                    changeStream.close();
                });
            }
            catch (err) {
                socket.emit("subscriptionError", `Failed to connect to game: ${gameId} with error: ${err.message}.\nClosing socket`);
                socket.disconnect();
            }
        }));
    });
};
exports.setupGameSocket = setupGameSocket;
