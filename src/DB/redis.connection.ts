import {createClient, RedisClientType} from "redis";
import { redisUrl } from "../config/config.service";

export const client:RedisClientType=createClient({url:redisUrl})
export async function redisConnect() {
    try {
        await client.connect()
        console.log("Redis DB Connected Successfully 👌👌")
    } catch (error) {
       throw error;
    }
}