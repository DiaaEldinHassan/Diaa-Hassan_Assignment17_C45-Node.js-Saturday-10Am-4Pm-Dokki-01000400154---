import { dbUri } from "../config/config.service";
import mongoose from "mongoose";

export const dbConnect=async():Promise<void>=>{
   try {
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
    console.log("DB Connected Successfully 👌👌")
   } catch (error) {
    throw error;
   }
}