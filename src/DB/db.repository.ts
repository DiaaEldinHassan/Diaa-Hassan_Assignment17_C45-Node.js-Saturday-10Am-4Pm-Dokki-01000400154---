import { Model } from "mongoose";
import usersModel from "./models/users.model";
import NewUser from "../common/interfaces/newUser.interface";
import { User } from "../common/interfaces/user.interface";
import { normalizeEmail } from "../common/utils/otp.utils";

const emailMatchCollation = { locale: "en", strength: 2 } as const;

class DBRepository{
 constructor(protected model:Model<any>)
 {
    this.model=model;
 }   
  async create(data:NewUser):Promise<string>{
    try {
        const user=new this.model(data);
        await user.save();
        return "Data Created Successfully";
    } catch (error) {
        throw error;
    } 
  }
  async findById(id:string):Promise<User|null>{
    try {
        return await this.model.findById(id);
    } catch (error) {
        throw error;
    }
  }
}
class userRepo extends DBRepository{
    constructor(){
        super(usersModel);
    }
    async findByEmail(email:string):Promise<User|null>{
        try {
            const n = normalizeEmail(email);
            return await this.model
                .findOne({ email: n })
                .collation(emailMatchCollation);
        } catch (error) {
            throw error;
        }
    }
    async setConfirmedByEmail(email: string, confirmed: boolean): Promise<void> {
        const n = normalizeEmail(email);
        const result = await this.model.updateOne(
            { email: n },
            { $set: { confirmed } },
            { collation: emailMatchCollation },
        );
        if (result.matchedCount === 0) {
            const err = new Error("User not found") as Error & { statusCode?: number };
            err.statusCode = 404;
            throw err;
        }
    }
    async deleteByEmail(email: string): Promise<void> {
        const n = normalizeEmail(email);
        await this.model.deleteOne({ email: n }, { collation: emailMatchCollation });
    }


    async updatePasswordForUserId(userId: string, newPlainPassword: string): Promise<void> {
        const doc = await this.model.findById(userId);
        if (!doc) {
            const err = new Error("User not found") as Error & { statusCode?: number };
            err.statusCode = 404;
            throw err;
        }
        doc.set("password", newPlainPassword);
        await doc.save();
    }
}
export const usersRepo=new userRepo();