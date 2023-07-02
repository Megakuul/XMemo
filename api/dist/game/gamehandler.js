import { Game } from "../models/game.js";
import { User } from "../models/user.js";
/**
 * Creates a Game
 * @param player1.id ID of player 1
 * @param player2.id ID of player 2
 * @param p1_username Username of player 1
 * @param p2_username Username of player 2
 * @param pairs Number of pairs to create
 * @param moveTimems Number of milliseconds that game moves can take
 * @returns Promise containing errors if it threw any
 */
export const createGame = async (p1, p2, pairs, moveTimems) => {
    try {
        const player1 = {
            id: p1.user_id,
            username: p1.username,
            title: p1.title,
            ranking: p1.ranking
        };
        const player2 = {
            id: p2.user_id,
            username: p2.username,
            title: p2.title,
            ranking: p2.ranking
        };
        const game = new Game({
            player1: player1,
            player2: player2,
            active_id: player1.id,
            // The initial Gamemove will be twice as long as the moveTime
            nextmove: new Date(Date.now() + moveTimems * 2).toUTCString(),
            moveTimems: moveTimems,
            game_stage: 1,
            moves: 0,
            cards: generateCards(pairs)
        });
        await game.save();
    }
    catch (err) {
        throw new Error(`Error creating game: ${err}`);
    }
};
/**
 * This function will generate the card deck
 * @param pairs Number of pairs to generate
 */
const generateCards = (pairs) => {
    let tempCardList = [];
    for (let i = 0; i < Number(pairs); i++) {
        for (let j = 0; j < 2; j++) {
            tempCardList.push({
                tag: i,
                discovered: false,
                captured: false,
            });
        }
    }
    shuffle(tempCardList);
    return tempCardList;
};
/**
 * This function will randomly shuffle the array
 *
 * sideeffects:
 * This function will only influence the provided array object
 * @param array object array
 */
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
/**
 * Manages the logic for executing a player's move.
 *
 * sideeffects:
 * This function will only influence the provided game object
 * And will also influence the database collections "Users"
 * @param game Game Object
 * @param enemy_id ID of the player which is not currently active
 * @param discover_id ID of the card that should be discovered
 * @returns Promise containing errors if it threw any
 */
export const move = async (game, enemy_id, discover_id) => {
    // Fetch the changed card
    const changedCard = game.cards.find((card) => card._id.toString() === discover_id);
    // Check card
    if (!changedCard) {
        throw new Error(`Card with id: ${discover_id} not found`);
    }
    if (changedCard.captured) {
        throw new Error(`Card is already captured`);
    }
    if (changedCard.discovered) {
        throw new Error(`Card is already discovered`);
    }
    switch (game.game_stage) {
        case 1:
            await handleStage1(game);
            break;
        case 2:
            await handleStage2(game, enemy_id, changedCard);
            break;
        case -1:
            throw new Error(`Game has finished and is now readonly`);
        default:
            throw new Error(`The game has become corrupted. Please contact an administrator for assistance.`);
    }
    // Increment the moves counter
    game.moves++;
    // Set the discovered card to discovered
    changedCard.discovered = true;
    game.active_id = game.active_id;
    // Set the nextmove time
    game.nextmove = new Date(Date.now() + game.moveTimems).toUTCString();
    // Save the changes
    await game.save();
};
/**
 * Handles the first stage of a full move
 *
 * sideeffects:
 * This function will only influence the provided game object
 * @param game Game Object
 */
const handleStage1 = async (game) => {
    // Cover all cards
    game.cards.forEach((card) => {
        card.discovered = false;
    });
    // Set game_stage to 2
    game.game_stage = 2;
};
/**
 * Handles the second stage of a full move
 *
 * sideeffects:
 * This function will only influence the provided game object
 */
const handleStage2 = async (game, enemy_id, changedCard) => {
    let foundMatch = false;
    let foundWinner = false;
    // Iterate over the cards of the game
    for (let i = 0; i < game.cards.length; i++) {
        // Check for a match
        if (game.cards[i].discovered && changedCard.tag === game.cards[i].tag) {
            captureMatchedCards(game, [changedCard, game.cards[i]]);
            foundMatch = true;
        }
    }
    // Check if a cards is not captured
    const hasUncapturedCards = game.cards.some(card => card.captured === false);
    if (!hasUncapturedCards) {
        foundWinner = true;
    }
    // If a winner is found
    if (foundWinner) {
        await handleGameOver(game);
    }
    else {
        // Set game_stage to 1
        game.game_stage = 1;
        // Set the active player to the enemy if no match was found
        game.active_id = foundMatch ? game.active_id : enemy_id;
    }
};
/**
 * Marks all provided cards as captured and sets the owner_id to the currently active user
 *
 * sideeffects:
 * This function will only influence the card array (and the objects inside of it)
 * @param game Game Object
 * @param cards Card array
 */
const captureMatchedCards = (game, cards) => {
    for (let i = 0; i < cards.length; i++) {
        cards[i].captured = true;
        cards[i].discovered = false;
        cards[i].owner_id = game.active_id;
    }
};
/**
 * Handles the ending of a game (if all cards are captured)
 *
 * sideeffects:
 * This function will only influence the provided game object
 * @param game Game Object
 */
const handleGameOver = async (game) => {
    const countresult = countCards(game);
    if (countresult.draw) {
        game.draw = true;
    }
    else {
        game.winner_username = countresult.winner.username;
    }
    let rankUpdates = await calculateRankingAndIncrement(countresult.winner, countresult.loser, countresult.draw);
    // Append ranking update 
    // (this is here so that it can be displayed without making a additional Database request)
    if (game.player1.id == rankUpdates.p1_id && game.player2.id == rankUpdates.p2_id) {
        game.player1.rankupdate = rankUpdates.p1_update;
        game.player2.rankupdate = rankUpdates.p2_update;
    }
    else if (game.player1.id == rankUpdates.p2_id && game.player2.id == rankUpdates.p1_id) {
        game.player1.rankupdate = rankUpdates.p2_update;
        game.player2.rankupdate = rankUpdates.p1_update;
    }
    game.game_stage = -1;
    game.active_id = "";
};
/**
 * This function will count cards for both players and returns the winner
 *
 * sideeffects:
 * This function will NOT influence the provided game object
 * @param game Game Object
 * @returns id of the player that won the game or "null" if it is a draw
 */
const countCards = (game) => {
    let p1_count = 0;
    let p2_count = 0;
    for (let i = 0; i < game.cards.length; i++) {
        if (game.cards[i].owner_id === game.player1.id) {
            p1_count++;
        }
        else if (game.cards[i].owner_id === game.player2.id) {
            p2_count++;
        }
    }
    // If it is a draw it still randomly assigns a winner and a loser
    // This is required to calculate the Elo on a draw
    const result = {
        winner: p1_count > p2_count ? game.player1 : game.player2,
        loser: p1_count > p2_count ? game.player2 : game.player1,
        draw: p2_count == p1_count ? true : false,
        winner_count: p1_count > p2_count ? p1_count : p2_count,
        loser_count: p1_count > p2_count ? p2_count : p1_count
    };
    return result;
};
const maxEloScore = 50;
const winnerScore = 1;
const drawScore = 0.5;
const loserScore = 0;
/**
 * Calculates the Ranking and write it to the database
 *
 * sideeffects:
 * This function will not influence another variable, but it will influence the database collection "Users"
 *
 *
 * This function uses a Algorithm to calculate the ranking update for each player
 * @param winner_id id of the winner
 * @param loser_id id of the loser
 */
const calculateRankingAndIncrement = async (winner, loser, draw) => {
    // These variables calculate the expected result based on probability and the ranking
    let tmpWinner_expected = 1 / (1 + Math.pow(10, ((loser.ranking - winner.ranking) / 400)));
    let tmpLoser_expected = 1 - tmpWinner_expected;
    // These variables calculate the ranking update for the players based on the Elo ranking system
    let tmpWinner_rank = Math.round(maxEloScore * ((draw ? drawScore : winnerScore) - tmpWinner_expected));
    let tmpLoser_rank = Math.round(maxEloScore * ((draw ? drawScore : loserScore) - tmpLoser_expected));
    await User.findByIdAndUpdate(winner.id, {
        $inc: {
            ranking: tmpWinner_rank
        }
    });
    await User.findByIdAndUpdate(loser.id, {
        $inc: {
            ranking: tmpLoser_rank
        }
    });
    // For the return it does not matter which player is the winner
    // this only matters to calculate the elo
    // This return converts "winner" and "loser" back to player1 and 2
    return {
        p1_id: winner.id,
        p2_id: loser.id,
        p1_update: tmpWinner_rank,
        p2_update: tmpLoser_rank,
    };
};
