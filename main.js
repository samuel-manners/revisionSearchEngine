const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv');
const port = process.env.PORT || 8080;
const { handleVisionRequest } = require('./AIVision.js');
const { searchHandler } = require('./searchUtils');

app.use(bodyParser.json());
dotenv.config();

app.get('/recycling_database_api', async (req, res) => {
  console.log('Get Request Recieved');
  const searchType = req.query.searchType;
  let searchResults = [];
  //Checks SearchType for how to handle and passes request to relevent function
  if (searchType == "'Brand'") {
    searchResults = await searchHandler("Brand", req.query.brand);
  } else if (searchType == "'Name'") {
    searchResults = await searchHandler("Name", req.query.name);
  } else {
    res.status(400).json({ message: 'Bad Request - Type of Search is Invalid' })
  }
  //Checks results have come back, otherwise provides a http error code
  if (searchResults != null) {
    res.json(searchResults);
  } else {
    res.status(404).json({ message: 'Data not found' });
  }
});

// Define the route for the API
app.post('/cloudvisionapi', async (req, res) => {
  console.log('Post Request Recieved');
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
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})