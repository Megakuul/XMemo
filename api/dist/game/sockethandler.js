import { Game } from "../models/game.js";
import { GameQueue } from "../models/queue.js";
import { User } from "../models/user.js";
// TODO: Document function
export const setupQueueTrigger = async (callback) => {
    const loadQueue = async () => {
        const queue = await GameQueue.find({});
        callback(queue, null);
    };
    try {
        loadQueue();
        const queueStream = await GameQueue.watch();
        queueStream.on("change", async () => {
            await loadQueue();
        });
    }
    catch (err) {
        callback(undefined, err);
    }
};
// TODO: Document function
export const setupLeaderboardTrigger = async (callback) => {
    const loadLeaderboard = async () => {
        const leaderboard = await User.find({}, 'username ranking')
            .sort({ ranking: -1 });
        callback(leaderboard, null);
    };
    try {
        await loadLeaderboard();
        const userStream = await User.watch();
        userStream.on("change", async () => {
            await loadLeaderboard();
        });
    }
    catch (err) {
        callback(undefined, err);
    }
};
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
export const handleGameUpdate = async (socket, gameId, successStream, errorStream, unsubscribeStream) => {
    try {
        let game = await Game.findById(gameId);
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
        gameStream.on("change", async (change) => {
            if (process.env.PARTIAL_UPDATE_MODE?.toLowerCase() === "true") {
                incrementGameboardChanges(game, change);
            }
            else {
                game = await Game.findById(gameId);
            }
            socket.emit(successStream, formatGameboard(game));
        });
        // Close live datastream on unsubscribe
        socket.on(unsubscribeStream, () => {
            gameStream.close();
        });
    }
    catch (err) {
        socket.emit(errorStream, `Game with ID: ${gameId} not found.`, err.message);
    }
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
 *
 * sideeffects:
 * This function will only influence the provided game object
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
