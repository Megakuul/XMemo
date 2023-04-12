import { Schema, Document, model } from 'mongoose';

interface ICard {
  discovered: boolean;
  captured: boolean;
  owner_id: string;

  symbol_path: string;
}

interface IGame extends Document {
  p1_id: string;
  p2_id: string;

  cards: ICard[];
}

const CardSchema: Schema = new Schema<ICard>({
  discovered: { type: Boolean, required: true },
  captured: { type: Boolean, required: true },
  owner_id: { type: String, required: false },

  symbol_path: { type: String, required: true }
})

const GameSchema: Schema = new Schema<IGame>({
  p1_id: { type: String, required: true },
  p2_id: { type: String, required: true },

  cards: { type: [CardSchema], required: true }
})

export const Game = model<IGame>('Game', GameSchema);