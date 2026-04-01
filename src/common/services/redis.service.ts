import { client } from "../../DB/redis.connection";

export async function setSession(key:string,value:string,ttl:number){
    try {
        await client.set(key,value,{EX:ttl})
    } catch (error) {
        throw error;
    }
}

export async function getSession(key:string){
    try {
        return await client.get(key)
    } catch (error) {
        throw error;
    }
}

export async function delSession(key:string){
    try {
        await client.del(key)
    } catch (error) {
        throw error;
    }
}
