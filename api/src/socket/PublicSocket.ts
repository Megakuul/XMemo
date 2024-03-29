import { Server, Socket } from "socket.io";
import { GameQueue } from "../models/queue.js";
import { User } from "../models/user.js";
import { handleGameUpdate, useDatabaseTrigger  } from "./PublicSocket.handler.js";
import { emitSeveral, removeDisconnectedSockets } from "./PublicSocket.helper.js";
import { LogWarn } from "../logger/logger.js";

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
export const setupPublicSocket = async (io: Server) => {

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
      LogWarn(String(err));
    }
  });

  await useDatabaseTrigger(User, async () => {
    try {
      LeaderBoard = await User.find({},
        'username title ranking')
        .sort({ ranking: -1 })
        .limit(100)
        .lean();
      
      emitSeveral(leaderboardSubscribers, "leaderboardUpdate", LeaderBoard);
    } catch (err: any) {
      emitSeveral(leaderboardSubscribers, "leaderboardUpdateError", err.message);
      LogWarn(String(err));
    }
  });

  io.on("connection", (socket: Socket) => {
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
  removeDisconnectedSockets(
    [
      queueSubscribers,
      leaderboardSubscribers
    ], 1000 * 60
  );
};