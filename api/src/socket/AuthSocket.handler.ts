import { Socket } from "socket.io";
import { Game, IGame } from "../models/game.js";
import { formatGameboard } from "./PublicSocket.handler.js";
import { User } from "../models/user.js";


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
export const handleCurrentGameUpdate = async (
  socket: Socket,
  userid: string,
  successStream: string,
  errorStream: string,
  unsubscribeStream: string
) => {

  try {
    // Constructing pipe to select games to watch
    const watchPipe = [
      {
        $match: {
          "operationType": "insert",
          $or: [
            { "fullDocument.player1.id": userid },
            { "fullDocument.player2.id": userid }
          ]
        }
      },
    ];

    // Fetch displayedGames (determines how much documents are displayed)
    const displayedGames = (await User.findById(userid))?.displayedgames;

    // Fetch inital Games
    const games: any = await Game.find({
      $or: [
        { "player1.id": userid },
        { "player2.id": userid }
      ]
    })
    // Sort the Documents by created attribute
    .sort({ created: 1 })
    .limit(displayedGames ?? 10);
    if (!games) {
      socket.emit(errorStream, `No Games found`);
      return;
    }

    // Load initial Games
    games.forEach((game: IGame) => {
      socket.emit(successStream, formatGameboard(game));
    });

    // Retrieve live datastream from the database
    const gamesStream = Game.watch(watchPipe);

    // Fire a gameupdate when the data changes
    gamesStream.on("change", async (change: any) => {
      const { cards, ...gameWithoutCards } = change.fullDocument;
      socket.emit(successStream, gameWithoutCards);
    });

    // Close live datastream on unsubscribe
    socket.on(unsubscribeStream, () => {
      gamesStream.close();
    });

  } catch (err: any) {
    socket.emit(errorStream, err.message);
  }
}

