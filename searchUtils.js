//Database connection import
const createConnection = require('./db');

//Redis Search Requirements
const redis = require('redis');
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;
if (!cacheHostName) throw Error("AZURE_CACHE_FOR_REDIS_HOST_NAME is empty");
if (!cachePassword) throw Error("AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty");

const config =
{
    url: `rediss://${cacheHostName}:6380`,
    password: cachePassword
};

const cacheConnection = redis.createClient(config);


async function searchHandler (searchType, searchParam) {
    if (searchType == "Brand") {
        //Try Cache first, if no response try DB search
        const cacheResults = await cacheSearch(searchParam);
        if (cacheResults == null) {
            const dbResults = await dbSearch('brand', searchParam);
            return dbResults;
        } else{
            return cacheResults;
        }
    } else if (searchType == "'Name'") {
        const dbResults = dbSearch('name', searchParam);
        return dbResults;
    }
};


async function cacheSearch(brand) {
    await cacheConnection.connect();
    //Look Aside Caching - Ref :https://www.youtube.com/watch?v=krSgKN-5DHs&list=LL&index=1&t=118s
    //TO-DO - Add nameSearch caching
    try {
        const cacheKey = brand;//Design Cache Key Method
        let cacheEntry = await cacheConnection.get(cacheKey);

        if (cacheEntry) {
            console.log('Found in Cache');
            cacheConnection.disconnect();
            return JSON.parse(cacheEntry);
        } else {
            console.log('Not found in cache, attempting DB search')
            cacheConnection.disconnect();
            return null;
        }

    } catch (error) {
        console.error('Error retrieving data from cache:', error);
        cacheConnection.disconnect();
        return null;
    }
}

async function dbSearch(searchType, searchParam){
    try {
        if (typeof searchParam === 'undefined') {
            console.log("Search Parameters undefined");
            return null;
        } else if (typeof searchType === 'undefined') {
            console.log("Search Type undefined");
            return null;
        }


        const connection = await createConnection();
        //New style search query, single function for database queries
        const query = "SELECT name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE " + searchType + " = " + searchParam;
        const [rows] = await connection.query(query);
        connection.end();

        if (rows.length > 0) {
            if (searchType == 'brand'){
                await cacheConnection.connect();
                await cacheConnection.set(searchParam, JSON.stringify(rows));
                console.log('Logged to cache');
                cacheConnection.disconnect();
            }
            return rows;
        } else {
            console.log('Error getting Data');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving data from the MySQL database', error);
        return null; // Handle the error appropriately based on your use case
    }
}

// Export the methods
module.exports = {
    searchHandler
};