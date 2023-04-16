import { Game } from "../models/game.js";
import { User } from "../models/user.js";
/**
 * Creates a Game
 * @param p1_id ID of player 1
 * @param p2_id ID of player 2
 * @param p1_username Username of player 1
 * @param p2_username Username of player 2
 * @param pairs Number of pairs to create
 * @returns Promise containing errors if it threw any
 */
export const createGame = async (p1_id, p2_id, p1_username, p2_username, pairs) => {
    try {
        const game = new Game({
            p1_id: p1_id,
            p2_id: p2_id,
            p1_username: p1_username,
            p2_username: p2_username,
            active_id: p1_id,
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
    switch (game.game_stage) {
        case 1:
            await handleStage1(game);
            break;
        case 2:
            await handleStage2(game, enemy_id, changedCard);
            break;
        case -1:
            throw new Error(`Game is finished the winner is ${game.winner_username} the game is now readonly`);
        default:
            throw new Error(`The game has become corrupted. Please contact an administrator for assistance.`);
    }
    // Increment the moves counter
    game.moves++;
    // Set the discovered card to discovered
    changedCard.discovered = true;
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
    let foundWinner = true;
    // Iterate over the cards of the game
    for (let i = 0; i < game.cards.length; i++) {
        // Check for a match
        if (game.cards[i].discovered && changedCard.tag === game.cards[i].tag) {
            captureMatchedCards(game, [changedCard, game.cards[i]]);
            foundMatch = true;
            break;
        }
        // Check if a cards is not captured
        if (!game.cards[i].captured) {
            foundWinner = false;
        }
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
        await calculateRankingAndIncrement(countresult.winner_id, countresult.loser_id);
        game.winner_username = countresult.winner_id === game.p1_id ? game.p1_username : game.p2_username;
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
        if (game.cards[i].owner_id === game.p1_id) {
            p1_count++;
        }
        else if (game.cards[i].owner_id === game.p2_id) {
            p2_count++;
        }
    }
    const result = {
        winner_id: p1_count > p2_count ? game.p1_id : game.p2_id,
        loser_id: p1_count > p2_count ? game.p2_id : game.p1_id,
        draw: p2_count == p1_count ? true : false,
        winner_count: p1_count > p2_count ? p1_count : p2_count,
        loser_count: p1_count > p2_count ? p2_count : p1_count
    };
    return result;
};
/**
 * Calculates the Ranking and write it to the database
 *
 * sideeffects:
 * This function will not influence another variable, but it will influence the database collection "Users"
 * @param winner_id id of the winner
 * @param loser_id id of the loser
 */
const calculateRankingAndIncrement = async (winner_id, loser_id) => {
    //TODO eventually implement a ranking algorithmus right here
    await User.findByIdAndUpdate(winner_id, {
        $inc: {
            ranking: 10
        }
    });
    await User.findByIdAndUpdate(loser_id, {
        $inc: {
            ranking: -10
        }
    });
};
