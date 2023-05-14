import { Game } from "../models/game.js";
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
export const handleCurrentGameUpdate = async (socket, userid, successStream, errorStream, unsubscribeStream) => {
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
        // Fetch inital Games
        const games = await Game.find({
            $or: [
                { "player1.id": userid },
                { "player2.id": userid }
            ]
        });
        if (!games) {
            socket.emit(errorStream, `No Games found`);
            return;
        }
        // Load initial Games
        games.forEach((game) => {
            socket.emit(successStream, game);
        });
        // Retrieve live datastream from the database
        const gamesStream = Game.watch(watchPipe);
        // Fire a gameupdate when the data changes
        gamesStream.on("change", async (change) => {
            socket.emit(successStream, change.fullDocument);
        });
        // Close live datastream on unsubscribe
        socket.on(unsubscribeStream, () => {
            gamesStream.close();
        });
    }
    catch (err) {
        socket.emit(errorStream, err.message);
    }
};
