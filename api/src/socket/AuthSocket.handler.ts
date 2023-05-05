import { Socket } from "socket.io";
import { Game } from "../models/game";


/**
 * Sends Current Games to the user
 * 
 * sideeffects:
 * This function will not influence other variables, but it will use the provided Sockets to send messages to the Client
 * @param socket Socket to send updates
 * @param successStream Stream to send successfull updates
 * @param errorStream Stream to send failures/errors
 * @param unsubscribeStream Stream where the client can unsubscribe to the Game
 * @returns Void
 */
export const handleCurrentGameUpdate = async (socket: Socket, userid: string, successStream: string, errorStream: string, unsubscribeStream: string) => {
  try {
    // Constructing pipe to select the Game to watch
    const pipe = [
      {
        $match: {
          $or: [
            { p1_id: userid },
            { p2_id: userid }
          ],
          winner_username: { $in: [null, undefined] }
        }
      },
    ];

    // Retrieve live datastream from the database
    const gamesStream = Game.watch(pipe);

    // Fire a gameupdate when the data changes
    gamesStream.on("change", async (change: any) => {
      socket.emit(successStream, change);
    });

    // Close live datastream on unsubscribe
    socket.on(unsubscribeStream, () => {
      gamesStream.close();
    });

  } catch (err: any) {
    socket.emit(errorStream, err.message);
  }
}
