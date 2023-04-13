import { Schema, Document, model } from 'mongoose';

interface ICard {
  tag: string;
  discovered: boolean;
  captured: boolean;
  owner_id: string;
  partner_tag: string;
}

interface IGame extends Document {
  p1_id: string;
  p2_id: string;
  p1_username: string;
  p2_username: string;

  cards: ICard[];
}

const CardSchema: Schema = new Schema<ICard>({
  tag: { type: String, required: true },
  discovered: { type: Boolean, required: true },
  captured: { type: Boolean, required: true },
  owner_id: { type: String, required: false },
  partner_tag: { type: String, required: true }
})

const GameSchema: Schema = new Schema<IGame>({
  p1_id: { type: String, required: true },
  p2_id: { type: String, required: true },
  p1_username: { type: String, required: true },
  p2_username: { type: String, required: true },
  cards: { type: [CardSchema], required: true }
})

export const Game = model<IGame>('Game', GameSchema);