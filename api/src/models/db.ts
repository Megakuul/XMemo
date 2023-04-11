import {Error, Mongoose} from "mongoose";

export const connectMongoose = (mongoose: Mongoose, uri: string | undefined): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (uri===undefined) {
      reject(new Error("Error connecting to MongoDB: Failed to read uri"));
    } else {
      mongoose.connect(uri);

      mongoose.connection.on('connected', () => {
        resolve();
      });

      mongoose.connection.on('error', (err: Error) => {
        reject(new Error(`Error connecting to MongoDB: ${err}`));
      });
    }
  });
};