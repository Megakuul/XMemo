import { Server, Socket } from "socket.io";
import { Game } from "../models/game";
import { GameQueue } from "../models/queue";

export const setupGameSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {

    // If the client emits subscribe, this will subscribe to live changes from the selected Game
    socket.on("subscribe", async (gameId) => {
      try {
        const game: any = await Game.findById(gameId);
        if (!game) {
          // Close the Socket if the game does not exist
          socket.emit("subscriptionError", `Failed to connect to game: ${gameId}. Closing socket...`);
          socket.disconnect();
          return;
        }

        // Load initial Board
        socket.emit("gameLoad", )

        // Constructing pipe to select the Game to watch
        const pipe = [
          {
            $match: {
              "documentKey._id": game._id,
            },
          },
        ];

        // Retrieve live datastream from the database
        const changeStream = Game.watch(pipe);

        // Fire a gameupdate when the data changes
        // The board is rebuild on the client to optimize performance
        changeStream.on("change", (change) => {
          // TODO: Check if the partner_tag/tag was changed, if yes this information shouldn't be send to the user
          // This could be exploited to guess which card is the partner of the current card
          socket.emit("gameUpdate", change);
        });

        // Close live datastream on disconnect
        socket.on("disconnect", () => {
          changeStream.close();
        });

      } catch (err: any) {
        // Close the Socket if an error occurs
        socket.emit("subscriptionError", `Failed to connect to game: ${gameId} with error: ${err.message}.\nClosing socket`);
        socket.disconnect();
      }
    });
  });
};