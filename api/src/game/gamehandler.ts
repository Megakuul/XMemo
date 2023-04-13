import { Game } from "../models/game";
import { GameQueue } from "../models/queue";


export const createGame = async (p1_id: string, p2_id: string, p1_username: string, p2_username: string, pairs: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const game = new Game({
        p1_id: p1_id,
        p2_id: p2_id,
        p1_username: p1_username,
        p2_username: p2_username,
        cards: generateCards(pairs)
      });
    
      game.save();
      resolve();
    } catch (err) {
      reject(new Error(`Error creating game: ${err}`));
    }
  });
}

// Generate the Cards for the Game
const generateCards = (pairs: number): any => {
  let tempCardList = [];

  for (let i = 0; i < Number(pairs); i++) {
    tempCardList.push({
      tag: i,
      discovered: false,
      captured: false,
      partner_tag: i!=Number(pairs)-1 ? i+1 : 0,
    });
  }

  shuffle(tempCardList);

  return tempCardList;
}

// Shuffle the Cards
const shuffle = (array: object[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}