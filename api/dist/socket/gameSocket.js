import { Game } from "../models/game.js";
export const setupGameSocket = (io) => {
    io.on("connection", (socket) => {
        // If the client emits subscribe, this will subscribe to live changes from the selected Game
        socket.on("subscribe", async (gameId) => {
            try {
                let game = await Game.findById(gameId);
                if (!game) {
                    // Close the Socket if the game does not exist
                    socket.emit("subscriptionError", `Failed to connect to game: ${gameId}. Closing socket...`);
                    socket.disconnect();
                    return;
                }
                // Load initial Board
                socket.emit("gameLoad", formatGameboard(game));
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
                changeStream.on("change", async (change) => {
                    if (process.env.PARTIAL_UPDATE_MODE?.toLowerCase() === "true") {
                        incrementGameboardChanges(game, change);
                    }
                    else {
                        game = await Game.findById(gameId);
                    }
                    socket.emit("gameUpdate", formatGameboard(game));
                });
                // Close live datastream on disconnect
                socket.on("disconnect", () => {
                    changeStream.close();
                });
            }
            catch (err) {
                // Close the Socket if an error occurs
                socket.emit("subscriptionError", `Failed to connect to game: ${gameId} with error: ${err.message}.\nClosing socket`);
                socket.disconnect();
            }
        });
    });
};
/**
 * Formats the Gameboard for the client side
 * This will hide the link tags of the cards until they are discovered or captured
 * @param game Game Object
 * @returns Client Side Game Object
 */
const formatGameboard = (game) => {
    // This will create a deep copy of the gameCpy Object
    // And will also remove additional Mongoose database information we dont need
    const gameCpy = game.toObject();
    for (let i = 0; i < Number(gameCpy.cards.length); i++) {
        if (!gameCpy.cards[i].discovered && !gameCpy.cards[i].captured) {
            gameCpy.cards[i].tag = undefined;
        }
    }
    return gameCpy;
};
/**
 * Increment the changes from the Mongodb trigger at the game object
 * @param game Game Object
 * @param changes Change Object
 */
const incrementGameboardChanges = (game, changes) => {
    const { updateDescription } = changes;
    if (updateDescription) {
        const { updatedFields, removedFields } = updateDescription;
        for (const key in updatedFields) {
            const value = updatedFields[key];
            const path = key.split('.');
            let target = game;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            target[path[path.length - 1]] = value;
        }
        for (const key of removedFields) {
            const path = key.split('.');
            let target = game;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }
            delete target[path[path.length - 1]];
        }
    }
};
