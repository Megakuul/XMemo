import { handleGameUpdate, setupQueueTrigger, setupLeaderboardTrigger } from "../game/sockethandler.js";
// TODO: Make the code cleaner and more readable
export const setupGameSocket = async (io) => {
    let Queue;
    let LeaderBoard;
    const queueSubscribers = [];
    const leaderboardSubscribers = [];
    setupQueueTrigger((queue, error) => {
        if (!error) {
            Queue = queue;
            emitToSubscribers(queueSubscribers, "queueUpdate", queue);
        }
        else {
            emitToSubscribers(queueSubscribers, "queueUpdateError", error);
        }
    });
    setupLeaderboardTrigger((leaderboard, error) => {
        if (!error) {
            LeaderBoard = leaderboard;
            emitToSubscribers(leaderboardSubscribers, "leaderboardUpdate", leaderboard);
        }
        else {
            emitToSubscribers(leaderboardSubscribers, "leaderboardUpdateError", error);
        }
    });
    io.on("connection", (socket) => {
        socket.on("subscribeGame", async (gameId) => {
            await handleGameUpdate(socket, gameId, "gameUpdate", "gameUpdateError", "unsubscribeGame");
        });
        socket.on("subscribeQueue", async () => {
            socket.emit("queueUpdate", Queue);
            if (!isSocketInList(socket, queueSubscribers)) {
                queueSubscribers.push(socket);
            }
        });
        socket.on("unsubscribeQueue", async () => {
            removeFromList(socket, queueSubscribers);
        });
        socket.on("subscribeLeaderboard", async () => {
            socket.emit("leaderboardUpdate", LeaderBoard);
            if (!isSocketInList(socket, leaderboardSubscribers)) {
                leaderboardSubscribers.push(socket);
            }
        });
        socket.on("unsubscribeLeaderboard", async () => {
            removeFromList(socket, leaderboardSubscribers);
        });
    });
    removeDisconnectedSockets([
        queueSubscribers,
        leaderboardSubscribers
    ], 1000 * 60);
};
const emitToSubscribers = async (subscriberList, stream, content) => {
    subscriberList.forEach((socket) => {
        socket.emit(stream, content);
    });
};
const isSocketInList = (socket, list) => {
    return list.includes(socket);
};
const removeFromList = (socket, list) => {
    const index = list.indexOf(socket);
    if (index !== -1) {
        list.splice(index, 1);
    }
};
const removeDisconnectedSockets = (list, intervall) => {
    setInterval(() => {
        list.forEach((socketlist) => {
            socketlist.forEach((socket, index) => {
                if (socket.disconnected) {
                    socketlist.splice(index, 1);
                }
            });
        });
    }, intervall);
};
