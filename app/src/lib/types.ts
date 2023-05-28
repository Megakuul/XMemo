export interface ICard {
  rotate: boolean;
  _id: string;
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
}

export interface IPlayer {
  id: string;
  username: string;
  title: string;
  ranking: number;
  rankupdate: number;
}

export interface IGame {
  _id: any;
  player1: IPlayer;
  player2: IPlayer;
  winner_username: string;
  draw: boolean;
  active_id: string;
  game_stage: number;
  moves: number;
  created: Date;

  cards: ICard[];
}

export interface IGameQueue extends Document {
  user_id: string;
  username: string;
  ranking: number;
  title: string;
}