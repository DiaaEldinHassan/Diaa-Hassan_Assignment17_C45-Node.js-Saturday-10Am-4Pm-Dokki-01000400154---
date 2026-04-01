import {port} from "./config/config.service";
import express, { Application } from "express";
import cors from "cors";
import { globalErrorHandler } from "./Middlewares";
import { dbConnect, redisConnect } from "./DB";
import { auth,users } from "./Modules";

export const bootstrap=async():Promise<void>=>{
    const app: Application=express();
    // DB Connection
    await dbConnect();
    await redisConnect();
    // File Parsing
    app.use(express.json(),cors({
        origin:"http://localhost:5173",
        credentials:true
    }));
    // App Routes
    app.use("/auth",auth);
    app.use("/users",users);
    // MiddleWares
    app.use(globalErrorHandler)
    app.listen(port,()=>{
        console.log(`Server is running on port ${port} 🚀🚀`)
    })
    console.log("App is bootstrapped!");
}