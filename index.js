const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./db'); // Assuming db.js is in the same directory

const app = express();
const port = parseInt(process.env.PORT) || 8080;

app.use(bodyParser.json());

// Endpoint to get data based on oid
app.get('/recycling_database_api', async (req, res) => {
  const searchType = req.query.searchType;
  let searchResults = [];
  //Checks SearchType for how to handle and passes request to relevent function
  if (searchType == "'Brand'") {
    searchResults = await normalSearch(req);
  } else if (searchType == "'Name'") {
    searchResults = await nameSearch(req);
  } else if (searchType == "'UPC'") {
    searchResults = await upcSearch(req)
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

app.listen(port, () => {
  console.log(`Server is running`);
});


const normalSearch = async (req) => {
  const brand = req.query.brand;
  try {
    if (typeof brand === 'undefined') {
      console.log("Brand variable is undefined");
      return null;
    }

    const connection = await connect();
    const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE brand = " + brand;
    const [rows] = await connection.query(query);
    connection.release();

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

const nameSearch = async (req) => {
  const name = req.query.name;
  try {
    if (typeof name === 'undefined') {
      console.log("Name variable is undefined");
      return null;
    }

    const connection = await connect();
    const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE name = " + name;
    const [rows] = await connection.query(query);
    connection.release();

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

const upcSearch = async (req) => {
  const upc = req.query.UPC;
  try {
    if (typeof upc === 'undefined') {
      console.log("UPC variable is undefined");
      return null;
    }

    const connection = await connect();
    const query = "SELECT UPC, name, description, is_recyclable, packaging_material, brand FROM recyclable_household_items WHERE UPC = " + upc;
    const [rows] = await connection.query(query);
    connection.release();

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


