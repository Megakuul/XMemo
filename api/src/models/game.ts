import { Schema, Document, model, Types } from 'mongoose';

export interface ICard {
  _id: Types.ObjectId;
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
}

export interface IPlayer {
  _id: Types.ObjectId;
  id: string;
  username: string;
  title: string;
  ranking: number;
  rankupdate: number;
}

export interface IGame extends Document {
  player1: IPlayer;
  player2: IPlayer;
  winner_username: string;
  draw: boolean;
  active_id: string;
  nextmove: string;
  moveTimems: number;
  game_stage: number;
  moves: number;
  created: Date;

  cards: ICard[];
}

const CardSchema: Schema = new Schema<ICard>({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  tag: { type: String, required: true },
  discovered: { type: Boolean, required: true },
  captured: { type: Boolean, required: true },
  owner_id: { type: String, required: false }
})

const PlayerSchema: Schema = new Schema<IPlayer>({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  id: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String, required: true },
  ranking: { type: Number, required: true },
  rankupdate: { type: Number, required: false }
})

const GameSchema: Schema = new Schema<IGame>({
  player1: { type: PlayerSchema, required: true },
  player2: { type: PlayerSchema, required: true },
  winner_username: { type: String },
  draw: { type: Boolean },
  active_id: { type: String },
  nextmove: { type: String, required: true },
  moveTimems: { type: Number, required: true },
  game_stage: { type: Number, required: true },
  moves: { type: Number, required: false },
  cards: { type: [CardSchema], required: true },
  created: { type: Date, default: Date.now }
})

// Create indexes
GameSchema.index({ "player1.id": 1 });
GameSchema.index({ "player2.id": 1 });
GameSchema.index({ created: 1 });

export const Game = model<IGame>('Game', GameSchema);