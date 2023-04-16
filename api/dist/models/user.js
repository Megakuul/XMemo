import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String, required: false },
    title: { type: String, required: false },
    ranking: { type: Number, required: false }
});
// Check if Password got changed, if yes, hash the password
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
// Compare Password
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = model('User', UserSchema);
