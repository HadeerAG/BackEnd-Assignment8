import { createClient } from "redis"

export const redis_client = createClient({
  url: "rediss://default:gQAAAAAAAh2hAAIgcDJlYTRlNDA1ZGY5ZWY0NTYxOTFjZmUwMjRmYzlkMWE0OA@guiding-swan-138657.upstash.io:6379"
});

export default async function connectionRedis() {

try {
        await redis_client.connect();
    console.log("Redis connected successfully .. 🎉");
    
} catch (error) {

        console.log("Redis connection failed .. 😣🤔");

    
}


}