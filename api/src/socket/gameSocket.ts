import { Server, Socket } from "socket.io";
import { GameQueue } from "../models/queue.js";
import { User } from "../models/user.js";
import { handleGameUpdate, useDatabaseTrigger  } from "./gameSocket.handler.js";
import { emitSeveral, removeDisconnectedSockets, removeFromList } from "./gameSocket.helper.js";

export const setupGameSocket = async (io: Server) => {

  let Queue: any;
  let LeaderBoard: any;

  const queueSubscribers: Socket[] = [];
  const leaderboardSubscribers: Socket[] = [];

  await useDatabaseTrigger(GameQueue, async () => {
    try {
      Queue = await GameQueue.find({});

      emitSeveral(queueSubscribers, "queueUpdate", Queue);
    } catch (err: any) {
      emitSeveral(queueSubscribers, "queueUpdateError", err.message);
    }
  });

  await useDatabaseTrigger(User, async () => {
    try {
      LeaderBoard = await User.find({},
        'username ranking')
        .sort({ ranking: -1 })
        .limit(200);

      emitSeveral(leaderboardSubscribers, "leaderboardUpdate", LeaderBoard);
    } catch (err: any) {
      emitSeveral(leaderboardSubscribers, "leaderboardUpdateError", err.message);
    }
  });

  io.on("connection", (socket: Socket) => {

    socket.on("subscribeGame", async (gameId) => {
      await handleGameUpdate(socket, gameId, "gameUpdate", "gameUpdateError", "unsubscribeGame");
    });

    socket.on("subscribeQueue", async () => {
      socket.emit("queueUpdate", Queue);
      if (!queueSubscribers.includes(socket)) {
        queueSubscribers.push(socket);
      }
    });

    socket.on("unsubscribeQueue", async () => {
      removeFromList(socket, queueSubscribers);
    });

    socket.on("subscribeLeaderboard", async () => {
      socket.emit("leaderboardUpdate", LeaderBoard);
      if (!leaderboardSubscribers.includes(socket)) {
        leaderboardSubscribers.push(socket);
      }
    });

    socket.on("unsubscribeLeaderboard", async () => {
      removeFromList(socket, leaderboardSubscribers);
    });
  });

  removeDisconnectedSockets(
    [
      queueSubscribers,
      leaderboardSubscribers
    ], 1000 * 60
  );
};