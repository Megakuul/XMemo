"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = exports.createGame = void 0;
const game_1 = require("../models/game");
/**
 * Creates a Game
 * @param p1_id ID of player 1
 * @param p2_id ID of player 2
 * @param p1_username Username of player 1
 * @param p2_username Username of player 2
 * @param pairs Number of pairs to create
 * @returns Promise containing errors if it threw any
 */
const createGame = (p1_id, p2_id, p1_username, p2_username, pairs) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            const game = new game_1.Game({
                p1_id: p1_id,
                p2_id: p2_id,
                p1_username: p1_username,
                p2_username: p2_username,
                active_id: p1_id,
                game_stage: 1,
                moves: 0,
                cards: generateCards(pairs)
            });
            game.save();
            resolve();
        }
        catch (err) {
            reject(new Error(`Error creating game: ${err}`));
        }
    });
});
exports.createGame = createGame;
// Generate the Cards for the Game
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
// Shuffle the Cards
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
/**
 * Manages the logic for executing a player's move.
 * @param game Game Object
 * @param enemy_id ID of the player which is not currently active
 * @param discover_id ID of the card that should be discovered
 * @returns Promise containing errors if it threw any
 */
const move = (game, enemy_id, discover_id) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        // Fetch the changed card
        const changedCard = game.cards.find((card) => card._id.toString() === discover_id);
        // Check card
        if (!changedCard) {
            reject(new Error(`Card with id: ${discover_id} not found`));
        }
        // Check the game_stage
        if (game.game_stage === 1) {
            // Cover all cards
            game.cards.forEach((card) => {
                card.discovered = false;
            });
            // Set game_stage to 2
            game.game_stage = 2;
        }
        else {
            let foundMatch = false;
            // Check if the discovered card matches with another card
            for (let i = 0; i < game.cards.length; i++) {
                if (game.cards[i].discovered && changedCard.tag === game.cards[i].tag) {
                    game.cards[i].captured = true;
                    changedCard.captured = true;
                    foundMatch = true;
                    break;
                }
            }
            // Set game_stage to 1
            game.game_stage = 1;
            // Set the active player to the enemy if no match was found
            game.active_id = foundMatch ? game.active_id : enemy_id;
        }
        // Increment the moves counter
        game.moves++;
        // Set the discovered card to discovered
        changedCard.discovered = true;
        // Save the changes
        yield game.save();
        resolve();
    }));
};
exports.move = move;
