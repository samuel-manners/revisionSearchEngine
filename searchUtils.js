const createConnection = require('./db');
const redisClient = require('./redisClient.js');

const searchHandler = async (searchType, searchParam) => {
    if (searchType == "Brand") {
        //Try Cache first, if no response try DB search
        const cacheResults = await cacheSearch(searchParam);
        if (cacheResults == null) {
            const dbResults = await dbSearch('brand', searchParam);
            return dbResults;
        }
    } else if (searchType == "'Name'") {
        const dbResults = dbSearch('name', searchParam);
        return dbResults;
    }
};


const cacheSearch = async (brand) => {
    //Look Aside Caching - Ref :https://www.youtube.com/watch?v=krSgKN-5DHs&list=LL&index=1&t=118s
    //TO-DO - Add nameSearch caching
    try {
        const cacheKey = brand;//Design Cache Key Method
        let cacheEntry = await redisClient.get(cacheKey);

        if (cacheEntry) {
            cacheEntry = JSON.parse(cacheEntry);
            return { ...cacheEntry, 'source': 'cache' };
        } else {
            return null;
        }

    } catch (error) {
        console.error('Error retrieving data from cache:', error);
        return null;
    }
}

const dbSearch = async (searchType, searchParam) => {
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