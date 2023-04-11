import { Schema, Document, model } from "mongoose";
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  username: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre<IUser>('save', async function (next: any) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', UserSchema);