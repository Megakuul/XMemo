import { Schema, Document, model } from 'mongoose';

export interface IConfig extends Document {
    rankedcardpairs: number;
    rankedmovetime: number;
    titlemap: Map<number, string>;
}

const ConfigSchema: Schema = new Schema<IConfig>({
    rankedcardpairs: { type: Number, required: true, default: 20 },
    rankedmovetime: { type: Number, required: true, default: 20 },
    titlemap: { type: Map, required: true, default: {} },
});

export const Config = model<IConfig>('Game', ConfigSchema);