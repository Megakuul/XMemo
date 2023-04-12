import { Schema, Document, model } from "mongoose";
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  description: string;
  title: string;
  ranking: number;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: { type: String, required: false },
  title: { type: String, required: false },
  ranking: { type: Number, required: false }
});

// Check if Password got changed, if yes, hash the password
UserSchema.pre<IUser>('save', async function (next: any) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare Password
UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);