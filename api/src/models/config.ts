import { Schema, Document, model } from 'mongoose';

export interface IConfig extends Document {
    rankedcardpairs: number;
    rankedmovetime: number;
    titlemap: Map<number, string>;
}

const ConfigSchema: Schema = new Schema<IConfig>({
    _id: String,
    rankedcardpairs: { type: Number, required: true, default: 20 },
    rankedmovetime: { type: Number, required: true, default: 20 },
    titlemap: { type: Map, required: true, default: {} },
});

const Config = model<IConfig>('Config', ConfigSchema);

/**
 * GetConfig retrieves the XMemo configuration from database
 * 
 * Since there is only one central config document,
 * this function will search for the constant "config" _id.
 * 
 * If the config file is not found, it is created with default values.
 */
export const GetConfig = async (): Promise<IConfig | null> => {
    return await Config.findOne(
        { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
}

/**
 * GetRawConfig retrieves the XMemo configuration from database in json
 * 
 * Since there is only one central config document,
 * this function will search for the constant "config" _id.
 * 
 * If the config file is not found, it is created with default values.
 */
export const GetRawConfig = async (): Promise<Object | null> => {
    return await Config.findOne(
        { _id: "config" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
}