import { Server, Socket } from "socket.io";
import { handleGameUpdate, setupQueueTrigger, setupLeaderboardTrigger } from "../game/sockethandler.js";

// TODO: Make the code cleaner and more readable
export const setupGameSocket = async (io: Server) => {

  let Queue: any;
  let LeaderBoard: any;

  const queueSubscribers: Socket[] = [];
  const leaderboardSubscribers: Socket[] = [];

  setupQueueTrigger((queue: any, error: any) => {
    if (!error) {
      Queue = queue;
      emitToSubscribers(queueSubscribers, "queueUpdate", queue);
    } else {
      emitToSubscribers(queueSubscribers, "queueUpdateError", error);
    }
  });
  
  setupLeaderboardTrigger((leaderboard: any, error: any) => {
    if (!error) {
      LeaderBoard = leaderboard;
      emitToSubscribers(leaderboardSubscribers, "leaderboardUpdate", leaderboard);
    } else {
      emitToSubscribers(leaderboardSubscribers, "leaderboardUpdateError", error);
    }
  });

  io.on("connection", (socket: Socket) => {
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

  removeDisconnectedSockets(
    [
      queueSubscribers,
      leaderboardSubscribers
    ], 1000 * 60
  );
};

const emitToSubscribers = async (subscriberList: Socket[], stream: string, content: any) => {
  subscriberList.forEach((socket: Socket) => {
    socket.emit(stream, content)
  });
}

const isSocketInList = (socket: Socket, list: Socket[]): boolean => {
  return list.includes(socket);
}

const removeFromList = (socket: Socket, list: Socket[]) => {
  const index = list.indexOf(socket);
    if (index !== -1) {
      list.splice(index, 1);
    }
}

const removeDisconnectedSockets = (list: Array<Socket[]>, intervall: number) => {
  setInterval(() => {
    list.forEach((socketlist) => {
      socketlist.forEach((socket, index) => {
        if (socket.disconnected) {
          socketlist.splice(index, 1);
        }
      });
    });
  }, intervall);
}