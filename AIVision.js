const dotenv = require('dotenv');

const { getImageData } = require('./getImageData.js');
dotenv.config();

const apiKey = process.env.API_KEY;


// Define the route for the API
async function handleVisionRequest(base64Image) {  
  try {
    const logos = await getImageData(base64Image);
    return logos;
  } catch (error) {
    console.error(error)
  }
};

module.exports = {
  handleVisionRequest
};