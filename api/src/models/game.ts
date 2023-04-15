import { Schema, Document, model, Types } from 'mongoose';

interface ICard {
  _id: Types.ObjectId;
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
}

interface IGame extends Document {
  p1_id: string;
  p2_id: string;
  p1_username: string;
  p2_username: string;
  active_id: string;
  game_stage: number;
  moves: number;

  cards: ICard[];
}

const CardSchema: Schema = new Schema<ICard>({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  tag: { type: String, required: true },
  discovered: { type: Boolean, required: true },
  captured: { type: Boolean, required: true },
  owner_id: { type: String, required: false }
})

const GameSchema: Schema = new Schema<IGame>({
  p1_id: { type: String, required: true },
  p2_id: { type: String, required: true },
  p1_username: { type: String, required: true },
  p2_username: { type: String, required: true },
  active_id: { type: String, required: true },
  game_stage: { type: Number, required: true },
  moves: { type: Number, required: false },
  cards: { type: [CardSchema], required: true }
})

export const Game = model<IGame>('Game', GameSchema);