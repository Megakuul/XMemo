export interface ICard {
  rotate: boolean;
  _id: string;
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
}

export interface IGame {
  p1_id: string;
  p2_id: string;
  p1_username: string;
  p2_username: string;
  winner_username: string;
  draw: boolean;
  active_id: string;
  game_stage: number;
  moves: number;

  cards: ICard[];
}

export interface IGameQueue extends Document {
  user_id: string;
  username: string;
}