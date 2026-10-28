import { redis_client } from "../connection.redis.js";

//================ Set Value ====================//
export const setValue = async ({key,value,ttl}={})=> {
    try {
        value = typeof value == "string"? value: JSON.stringify(value)
        ttl? await redis_client.set(key ,value,{EX:ttl}):
        await redis_client.set(key ,value)
        
    } catch (error) {
        console.log(error, "\nRedis setValue failed");
        
    }
}

//================ Update Value ====================//
export const update = async ({key,value,ttl}={})=> {
    try {
        if (!await redis_client.exists(key)) return 0
        await redis_client.set(key ,value)
        
    } catch (error) {
        console.log(error, "\nRedis update failed");
        
    }
};

//================ Get Value ====================//
export const getValue = async (key)=> {
    try {
        try {
            return JSON.parse(await redis_client.get(key))
        } catch (error) {
           return await redis_client.get(key)
        }
    } catch (error) {
        console.log(error, "\nRedis get failed");
        
    }
};

//================ Calculating ttl ====================//
export const ttl = async (key)=> {
    try {
        return await redis_client.ttl(key)
    } catch (error) {
        console.log(error, "\nRedis ttl failed");
        
    }
};

//================ ttl exist ====================//
export const exist = async (key)=> {
    try {
        return await redis_client.exists(key)
    } catch (error) {
        console.log(error, "\nRedis exists failed");
        
    }
};

//================ key expiration ====================//
export const expire = async ({key,ttl})=> {
    try {
        return await redis_client.expire(key,ttl)
    } catch (error) {
        console.log(error, "\nRedis expire failed");
        
    }
};

//================ Delete key ====================//
export const deleteKey = async (key)=> {
    try {
        if(!key?.length)return 0
        return await redis_client.del(key)
    } catch (error) {
        console.log(error, "\nRedis delete key failed");
        
    }
};

//================ Get key ====================//
export const keys = async (key)=> {
    try {
        return await redis_client.keys(`${key}*`)
    } catch (error) {
        console.log(error, "\nRedis get key failed");
        
    }
};

//================ key increment ====================//
export const incr = async (key)=> {
    try {
        return await redis_client.incr(key)
    } catch (error) {
        console.log(error, "\nRedis key increment failed");
        
    }
};

