import { Error } from "mongoose";
export const connectMongoose = async (mongoose, uri) => {
    if (uri === undefined) {
        throw new Error("Error connecting to MongoDB: Failed to read uri");
    }
    else {
        await mongoose.connect(uri);
        mongoose.connection.on('connected', () => {
            return;
        });
        mongoose.connection.on('error', (err) => {
            throw new Error(err.message);
        });
    }
};
