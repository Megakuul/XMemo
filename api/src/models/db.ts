import {Error, Mongoose} from "mongoose";

export const connectMongoose = async (mongoose: Mongoose, uri: string | undefined): Promise<void> => {
  if (uri===undefined) {
    throw new Error("Error connecting to MongoDB: Failed to read uri");
  } else {
    await mongoose.connect(uri);

    mongoose.connection.on('connected', () => {
      return;
    });

    mongoose.connection.on('error', (err: Error) => {
      throw new Error(err.message);
    });
  }
};