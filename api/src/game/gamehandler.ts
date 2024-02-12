import { Game, ICard, IGame, IPlayer } from "../models/game.js";
import { IGameQueue } from "../models/queue.js";

/**
 * Creates a Game
 *
 * sideeffects:
 * This function will not influence anything
 * 
 * @param queue1 First queue object
 * @param queue2 Second queue object
 * @param pairs Number of pairs to create
 * @param moveTimems Number of milliseconds that game moves can take
 * @returns Promise with the created Game object. Game is not written to database!
 */
export const createGame = (queue1: IGameQueue, queue2: IGameQueue, pairs: number, moveTimems: number): IGame => {
  const player1: any = {
    id: queue1.user_id,
    username: queue1.username,
    title: queue1.title,
    ranking: queue1.ranking
  }

  const player2: any = {
    id: queue2.user_id,
    username: queue2.username,
    title: queue2.title,
    ranking: queue2.ranking
  }

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

  return game;
}

/**
 * Manages the logic for executing a player's move.
 * 
 * sideeffects:
 * This function will only influence the provided game object
 * Nothing is written to the database
 * 
 * @param dbsess Database session
 * @param game Game Object
 * @param enemy_id ID of the player which is not currently active
 * @param discover_id ID of the card that should be discovered
 * @returns Promise containing errors if it threw any
 */
export const move = (game: IGame, enemy_id: string, discover_id: number) => {
  // Fetch the changed card
  const changedCard = game.cards.find((card: any) => card._id.toString() === discover_id);

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
      handleStage1(game);
      break;
    case 2:
      handleStage2(game, enemy_id, changedCard!);
      break;
    case -1:
      throw new Error(`Game has finished and is now readonly`);
    default:
      throw new Error(`The game has become corrupted. Please contact an administrator for assistance.`);
  }

  // Increment the moves counter
  game.moves++;
  // Set the discovered card to discovered
  changedCard!.discovered = true;
  game.active_id=game.active_id;

  // Set the nextmove time
  game.nextmove = new Date(Date.now() + game.moveTimems).toUTCString();
};

/**
 * Handles the ending of a game
 * 
 * Function will update set the `winner_username` (or `draw` respectively)
 * and it will set the rank-incrementation for both players.
 * 
 * sideeffects:
 * This function will mutate the provided game object
 */
export const finishGame = (game: IGame) => {
  const countresult: CountResult = countCards(game);

  if (countresult.draw) {
    game.draw = true;
  } else {
    game.winner_username = countresult.winner.username;
  }
  let rankUpdates = calculateRanking(countresult.winner, countresult.loser, countresult.draw);
  
  // Append ranking update 
  // (this is here so that it can be displayed without making a additional Database request)
  if (game.player1.id == rankUpdates.p1_id && game.player2.id == rankUpdates.p2_id) {
    game.player1.rankupdate = rankUpdates.p1_update;
    game.player2.rankupdate = rankUpdates.p2_update;
  } else if (game.player1.id == rankUpdates.p2_id && game.player2.id == rankUpdates.p1_id) {
    game.player1.rankupdate = rankUpdates.p2_update;
    game.player2.rankupdate = rankUpdates.p1_update;
  }
};

/**
 * Gets the title based on the ranking and a titlemap
 * 
 * sideeffects:
 * This function will not influence anything
 * 
 * @param ranking Rankingpoints of the player
 * @param titleMap Title map containing ranking milestones as key and title as value
 * @param defaultTitle Title chosen if no milestone is reached
 * @returns Title for the respective ranking
 */
export const getTitle = (ranking: number, titleMap: Map<number, string>, defaultTitle: string): string => {
  // Create a map sorted by keys
  const sortedTitleMap = new Map([...titleMap].sort((a, b) =>
    // Compare keys (if a larger then b, b is before a)
    a[0] - b[0]
  ));
  for (let [k, v] of sortedTitleMap) {
    if (ranking > k) {
      return v;
    }
  }
  return defaultTitle;
}

/**
 * This function will generate the card deck
 * @param pairs Number of pairs to generate
 */
const generateCards = (pairs: number): any => {
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
}

/**
 * This function will randomly shuffle the array
 * 
 * sideeffects:
 * This function will only influence the provided array object
 * @param array object array
 */
const shuffle = (array: object[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


/**
 * Handles the first stage of a full move
 * 
 * sideeffects:
 * This function will only influence the provided game object
 * Nothing is written to the database
 * @param game Game Object
 */
const handleStage1 = (game: IGame) => {
  // Cover all cards
  game.cards.forEach((card: any) => {
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
 * Nothing is written to the database
 * 
 * If game is finished, game_stage is set to -1
 */
const handleStage2 = (game: IGame, enemy_id: string, changedCard: ICard) => {
  let foundMatch = false;
  let foundWinner = false;
  
  // Iterate over the cards of the game
  for (let i = 0; i < game.cards.length; i++) {
    
    // Check for a match
    if (game.cards[i].discovered && changedCard!.tag === game.cards[i].tag) {

      captureMatchedCards(game, [ changedCard, game.cards[i] ]);

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
    game.game_stage = -1;
    game.active_id = "";
  } else {
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
 * Nothing is written to the database
 * @param game Game Object
 * @param cards Card array
 */
const captureMatchedCards = (game: IGame, cards: ICard[]) => {
  for (let i = 0; i < cards.length; i++) {
    cards[i].captured = true;
    cards[i].discovered = false;
    cards[i].owner_id = game.active_id;
  }
};

interface CountResult {
  winner: IPlayer;
  loser: IPlayer;
  draw: boolean;

  winner_count: number;
  loser_count: number;
}

/**
 * This function will count cards for both players and returns the winner
 * 
 * sideeffects: 
 * This function will NOT influence the provided game object
 * @param game Game Object
 * @returns id of the player that won the game or "null" if it is a draw
 */
const countCards = (game: IGame): CountResult => {
  let p1_count: number = 0;
  let p2_count: number = 0;

  for (let i = 0; i < game.cards.length; i++) {
    if (game.cards[i].owner_id === game.player1.id) {
      p1_count++;
    } else if (game.cards[i].owner_id === game.player2.id) {
      p2_count++;
    }
  }

  // If it is a draw it still randomly assigns a winner and a loser
  // This is required to calculate the Elo on a draw
  const result: CountResult = {
    winner: p1_count > p2_count ? game.player1 : game.player2,
    loser: p1_count > p2_count ? game.player2 : game.player1,
    draw:  p2_count == p1_count ? true : false,

    winner_count: p1_count > p2_count ? p1_count : p2_count,
    loser_count: p1_count > p2_count ? p2_count : p1_count
  };
  return result;
}

const maxEloScore = 50;
const winnerScore = 1;
const drawScore = 0.5;
const loserScore = 0;
/**
 * Calculates the Ranking and write it to the database
 * 
 * sideeffects:
 * This function will modify nothing
 * @param winner_id id of the winner
 * @param loser_id id of the loser
 */
const calculateRanking = (winner: IPlayer, loser: IPlayer, draw: boolean): 
  { p1_id: string, p2_id: string, p1_update: number, p2_update: number } => {
  
  // These variables calculate the expected result based on probability and the ranking
  let tmpWinner_expected: number = 1 / (1+ Math.pow(10, ((loser.ranking - winner.ranking) / 400)));
  let tmpLoser_expected: number = 1 - tmpWinner_expected;

  // These variables calculate the ranking update for the players based on the Elo ranking system
  let tmpWinner_rank: number = Math.round(maxEloScore * ((draw ? drawScore : winnerScore) - tmpWinner_expected));
  let tmpLoser_rank: number = Math.round(maxEloScore * ((draw ? drawScore : loserScore) - tmpLoser_expected));

  // For the return it does not matter which player is the winner
  // this only matters to calculate the elo
  // This return converts "winner" and "loser" back to player1 and 2
  return { 
    p1_id: winner.id,
    p2_id: loser.id,
    p1_update: tmpWinner_rank,
    p2_update: tmpLoser_rank,
  };
}