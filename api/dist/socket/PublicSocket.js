import { GameQueue } from "../models/queue.js";
import { User } from "../models/user.js";
import { handleGameUpdate, useDatabaseTrigger } from "./PublicSocket.handler.js";
import { emitSeveral, removeDisconnectedSockets } from "./PublicSocket.helper.js";
/**
 * Initializes the Public Socket
 *
 * This Socket can be accessed by everyone, it is not authenticating the user
 *
 * To use a authenticated session, use the AuthSocket
 *
 *
 * Sideeffects:
 * This function will use the provided io (Server) object to send and receive messages
 * @param io Websocket Server
 */
export const setupPublicSocket = async (io) => {
    let Queue;
    let LeaderBoard;
    const queueSubscribers = [];
    const leaderboardSubscribers = [];
    await useDatabaseTrigger(GameQueue, async () => {
        try {
            Queue = await GameQueue.find({});
            emitSeveral(queueSubscribers, "queueUpdate", Queue);
        }
        catch (err) {
            emitSeveral(queueSubscribers, "queueUpdateError", err.message);
            console.error("[ Failed to update Queue ]:\n" + err);
        }
    });
    await useDatabaseTrigger(User, async () => {
        try {
            LeaderBoard = await User.find({}, 'username ranking')
                .sort({ ranking: -1 })
                .limit(100);
            emitSeveral(leaderboardSubscribers, "leaderboardUpdate", LeaderBoard);
        }
        catch (err) {
            emitSeveral(leaderboardSubscribers, "leaderboardUpdateError", err.message);
            console.error("[ Failed to update Leaderboard ]:\n" + err);
        }
    });
    io.on("connection", (socket) => {
        socket.once("subscribeGame", async (gameId) => {
            await handleGameUpdate(socket, gameId, "gameUpdate", "gameUpdateError");
        });
        socket.once("subscribeQueue", async () => {
            socket.emit("queueUpdate", Queue);
            if (!queueSubscribers.includes(socket)) {
                queueSubscribers.push(socket);
            }
        });
        socket.once("subscribeLeaderboard", async () => {
            socket.emit("leaderboardUpdate", LeaderBoard);
            if (!leaderboardSubscribers.includes(socket)) {
                leaderboardSubscribers.push(socket);
            }
        });
    });
    // TODO: Maybe just remove it from the list in the on "disconnect" function instead with the intervall
    removeDisconnectedSockets([
        queueSubscribers,
        leaderboardSubscribers
    ], 1000 * 60);
};
