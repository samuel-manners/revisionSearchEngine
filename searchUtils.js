//Database and Redis Imports
const createConnection = require('./db');
const redis = require('redis');
//Redis Config Information
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


async function searchHandler(searchType, searchParam) {
    //Generate relevent cacheKey and run query against cache
    if (searchType == "Brand") {
        const cacheKey = 'brand' + searchParam;
        const cacheResults = await cacheSearch(cacheKey);
        //Check cache results first, if none available perform database search
        if (cacheResults == null) {
            const dbResults = await dbSearch('brand', searchParam);
            return dbResults;
        } else {
            return cacheResults;
        }
    } else if (searchType == "Name") {
        const cacheKey = 'name' + searchParam;
        const cacheResults = await cacheSearch(cacheKey);
        if (cacheResults == null) {
            const dbResults = await dbSearch('name', searchParam);
            return dbResults;
        } else {
            return cacheResults;
        }
    }
};

//Look Aside Caching - Ref :https://www.youtube.com/watch?v=krSgKN-5DHs&list=LL&index=1&t=118s
async function cacheSearch(cacheKey) {
    await cacheConnection.connect();
    try {
        //Check cache to see if data available
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

async function dbSearch(searchType, searchParam) {
    //Verify data passed in correctly
    try {
        if (typeof searchParam === 'undefined') {
            console.log("Search Parameters undefined");
            return null;
        } else if (typeof searchType === 'undefined') {
            console.log("Search Type undefined");
            return null;
        }
        //Connect to database and run query, store results into array
        console.log('Attempting to connect to DB')
        const connection = await createConnection();
        console.log('Connection Made');
        const query = `SELECT  name, description, recycleType, brand FROM recyclable_household_items WHERE ${searchType} LIKE '%${searchParam.replace(/'/g, "")}%'`;
        const [rows] = await connection.query(query);
        connection.end();

        if (rows.length > 0) {

            //Generate cacheKey from combining searchType and searchParam, connect to cache and store data
            const cacheKey = searchType + searchParam;
            await cacheConnection.connect();
            await cacheConnection.set(cacheKey, JSON.stringify(rows));
            console.log('Logged to cache');
            cacheConnection.disconnect();
            //Return DB results
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
    searchHandler,
    cacheSearch,
    dbSearch
};