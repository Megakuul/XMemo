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
exports.createGame = void 0;
const game_1 = require("../models/game");
const createGame = (p1_id, p2_id, p1_username, p2_username, pairs) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            const game = new game_1.Game({
                p1_id: p1_id,
                p2_id: p2_id,
                p1_username: p1_username,
                p2_username: p2_username,
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
        tempCardList.push({
            tag: i,
            discovered: false,
            captured: false,
            partner_tag: i != Number(pairs) - 1 ? i + 1 : 0,
        });
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
