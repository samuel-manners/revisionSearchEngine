const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;
const { handleVisionRequest } = require('./AIVision.js');
const { searchHandler } = require('./searchUtils');

app.use(bodyParser.json());

//Route for standard DB search checks
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

// Route for AI Vision requests
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

  //Sends to vision function to find brand information from logo
  const logo = await handleVisionRequest(req.body.image);
  const logoRequest = "'" + logo[0] + "'";
  //Sends logo information to search handling function passing in the search its requesting and the previously discovered brand details
  const response = await searchHandler("Brand", logoRequest);
  if (response != null) {
    res.json(response);
  } else{
    res.status(404).json({ message: 'Data not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})