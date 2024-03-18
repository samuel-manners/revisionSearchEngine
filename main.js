const express = require('express');
const bodyParser = require('body-parser');
const createConnection = require('./db');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8080;
const { handleVisionRequest } = require('./AIVision.js');
const redisClient = require('./redisClient.js');

app.use(cors());
app.use(bodyParser.json());

// Endpoint to get data based on oid
app.get('/recycling_database_api', async (req, res) => {
  console.log('Get Request Recieved')
  const searchType = req.query.searchType;
  let searchResults = [];
  //Checks SearchType for how to handle and passes request to relevent function
  if (searchType == "'Brand'") {
    const brand = req.query.brand;
    searchResults = await searchHandler("Brand", brand);
  } else if (searchType == "'Name'") {
    const name = req.query.name;
    searchResults = await searchHandler("Name", name);
  } else {
    res.status(400).json({ message: 'Bad Request - Type of Search is Invalid' })
  }
  //Checks results have come back, otherwise provides a http error code
  if (searchResults != null) {
    res.json(searchResults);
    console.log('Provided Response:', searchResults);
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// Define the route for the API
app.post('/cloudvisionapi', async (req, res) => {
  console.log('Post Request Recieved')
  try {
    // Check if req.body contains an 'image' property
    if (!req.body || !req.body.image) {
      throw new Error('Invalid image data provided.');
    }
    if (req.body.image == null) {
      throw new Error('No image data provided');
    }

  } catch (error) {
    console.error(error);
    res.status(400).send('Request Image Invalid: ' + error.message);
  }
  const logo = await handleVisionRequest(req.body.image);

  const logoRequest = "'" + logo[0] + "'";
  const response = await searchHandler("Brand", logoRequest);
  console.log(response);
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})

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
  console.log('Attempting Cache Search');
  try {
    const cacheKey = brand;//Design Cache Key Method
    let cacheEntry = await redisClient.get(cacheKey);

    if (cacheEntry) {
      cacheEntry = JSON.parse(cacheEntry);
      return { ...cacheEntry, 'source': 'cache' };
    } else{
      return null;
    }

  } catch (error) {
    console.error('Error retrieving data from cache:', error);
    return null;
  }
}

const dbSearch = async (searchType, searchParam) => {
  console.log('Attempting Database Search');
  try {
    if (typeof searchParam === 'undefined') {
      console.log("Search Parameters undefined");
      return null;
    } else if (typeof searchType === 'undefined') {
      console.log("Search Type undefined");
    }


    const connection = await createConnection();
    //New style search query, single function for database queries
    const query = "SELECT name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE " + searchType + " = " + searchParam;
    console.log(query);
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

/*

const normalSearch = async (brand) => {
  try {
    if (typeof brand === 'undefined') {
      console.log("Brand variable is undefined");
      return null;
    }

    //Look Aside Caching - Ref :https://www.youtube.com/watch?v=krSgKN-5DHs&list=LL&index=1&t=118s
    const cacheKey = brand;//Design Cache Key Method
    let cacheEntry = await redisClient.get(cacheKey);

    if (cacheEntry) {
      cacheEntry = JSON.parse(cacheEntry);
      return { ...cacheEntry, 'source': 'cache' };
    } else {
      const connection = await createConnection();
      //Adapted for rough search to work with AI
      //Ref: https://www.w3schools.com/SQL/sql_like.asp
      const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE brand LIKE " + brand;
      const [rows] = await connection.query(query);
      connection.end();

      if (rows.length > 0) {
        redisClient.set(cacheKey, rows);
        return { ...rows, 'source': 'database' };
      } else {
        console.log('Error getting Data for brand:' + brand);
        return null;
      }
    }
  } catch (error) {
    console.error('Error retrieving data from the MySQL database', error);
    return null; // Handle the error appropriately based on your use case
  }
}

const nameSearch = async (name) => {
  try {
    if (typeof name === 'undefined') {
      console.log("Name variable is undefined");
      return null;
    }

    const connection = await createConnection();
    const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE name = " + name;
    const [rows] = await connection.query(query);
    connection.end();

    if (rows.length > 0) {
      return rows[0];
    } else {
      console.log('Error getting Data');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data from the MySQL database', error);
    return null; // Handle the error appropriately based on your use case
  }
}

const upcSearch = async (upc) => {
  //TO BE DISCONTINUED
  try {
    if (typeof upc === 'undefined') {
      console.log("UPC variable is undefined");
      return null;
    }

    const connection = await createConnection();
    const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE UPC = " + upc;
    const [rows] = await connection.query(query);
    connection.end();

    if (rows.length > 0) {
      return rows[0];
    } else {
      console.log('Error getting Data');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving data from the MySQL database', error);
    return null; // Handle the error appropriately based on your use case
  }
}
*/

