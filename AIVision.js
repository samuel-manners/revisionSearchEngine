const { getImageData } = require('./getImageData.js');

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