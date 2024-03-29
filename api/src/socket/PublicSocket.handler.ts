import { Socket } from "socket.io";
import { Game, IGame } from "../models/game.js";

/**
 * Listens for changes to a database model and sends a callback when changes occur.
 * The callback is also executed immediately when the function is executed
 * 
 * Example:
 * ```javascript
 *  await useDatabaseTrigger(User, async () => {
 *   try {
 *     const leaderboard = await User.find({},
 *       'username ranking')
 *       .sort({ ranking: -1 });
 *
 *     socket.emit("leaderboardUpdate", leaderboard)
 *   } catch (err: any) {
 *     socket.emit("leaderboardUpdateError", err.message);
 *  }
 * });
 * ```
 * 
 * @param Model Model to listen to
 * @param callback Function that will be executed if the databasemodel changes
 */
export const useDatabaseTrigger = async (Model: any, callback: Function) => {
  await callback();

  const databaseStream = await Model.watch();

  databaseStream.on("change", async () => {
    await callback();
  });
}

/**
 * Sends Board/Game Updates to the provided Socket
 * 
 * sideeffects:
 * This function will not influence other variables, but it will use the provided Sockets to send messages to the Client
 * @param socket Socket to send updates
 * @param gameId ID of the Board/Game
 * @param successStream Stream to send successfull updates
 * @param errorStream Stream to send failures/errors
 * @param unsubscribeStream Stream where the client can unsubscribe to the Game
 * @returns Void
 */
export const handleGameUpdate = async (socket: Socket, gameId: string, successStream: string, errorStream: string) => {

  try {
    let game: any = await Game.findById(gameId);
    if (!game) {
      socket.emit(errorStream, `Game with ID: ${gameId} not found.`);
      return;
    }

    // Load initial Board
    socket.emit(successStream, formatGameboard(game));

    // Constructing pipe to select the Game to watch
    const pipe = [
      {
        $match: {
          "documentKey._id": game._id,
        },
      },
    ];

    // Retrieve live datastream from the database
    const gameStream = Game.watch(pipe);

    // Fire a gameupdate when the data changes
    gameStream.on("change", async (change: any) => {
      if (process.env.PARTIAL_UPDATE_MODE?.toLowerCase() === "true") {
        incrementGameboardChanges(game, change);
      } else {
        game = await Game.findById(gameId);
      }
      socket.emit(successStream, formatGameboard(game));
    });

    // Close live datastream on disconnect
    socket.once("disconnect", () => {
      gameStream.close();
    });

  } catch (err: any) {
    socket.emit(errorStream, `Game with ID: ${gameId} not found.`, err.message);
  }
}


/**
 * Formats the Gameboard for the client side
 * This will hide the link tags of the cards until they are discovered or captured
 * @param game Game Object
 * @returns Client Side Game Object
 */
export const formatGameboard = (game: IGame) => {
  let gameCpy: any;

  if (typeof game.toObject === "function") {
    // Mongoose document, use toObject to create a regular Object as deep copy
    gameCpy = game.toObject();
  } else {
    // Not a Mongoose document, create a deep copy
    gameCpy = JSON.parse(JSON.stringify(game));
  }

  for (let i = 0; i < Number(gameCpy.cards.length); i++) {
    if (!gameCpy.cards[i].discovered && !gameCpy.cards[i].captured) {
      gameCpy.cards[i].tag = undefined;
    }
  }

  return gameCpy;
}

/**
 * Increment the changes from the Mongodb trigger at the game object
 * 
 * sideeffects:
 * This function will only influence the provided game object
 * @param game Game Object
 * @param changes Change Object
 */
const incrementGameboardChanges = (game: IGame, changes: any) => {
  const { updateDescription } = changes;

  if (updateDescription) {
    const { updatedFields, removedFields } = updateDescription;

    for (const key in updatedFields) {
      const value = updatedFields[key];
      const path = key.split('.');
      let target: any = game;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = value;
    }

    for (const key of removedFields) {
      const path = key.split('.');
      let target: any = game;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      delete target[path[path.length - 1]];
    }
  }
}