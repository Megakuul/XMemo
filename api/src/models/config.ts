import { Schema, Document, model } from 'mongoose';

export interface IConfig extends Document {
    confid: string;
    rankedcardpairs: number;
    rankedmovetime: number;
    titlemap: Record<number, string>;
}

const ConfigSchema: Schema = new Schema<IConfig>({
    confid: { type: String, required: true },
    rankedcardpairs: { type: Number, required: true, default: 20 },
    rankedmovetime: { type: Number, required: true, default: 20 },
    titlemap: { type: Object, required: true, default: {} },
});

const Config = model<IConfig>('Config', ConfigSchema);

/**
 * GetConfig retrieves the XMemo configuration from database
 * 
 * Since there is only one central config document,
 * this function will search for the constant "config" _id.
 * 
 * If the config file is not found, it is created with default values.
 *
 * On Errors an exception is thrown
 */
export const GetConfig = async (): Promise<IConfig> => {
    const config: IConfig | null = await Config.findOneAndUpdate(
        { confid: "defaultConfig" }, { }, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (config) {
        return config;
    } else {
        throw Error("Failed to read / create global configuration document!")
    }
}