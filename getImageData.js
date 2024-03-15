const vision = require('@google-cloud/vision')

const visionClient = new vision.ImageAnnotatorClient({ keyFilename: './re-vision-apis-key.json'});

async function getImageData(base64Image) {
    const modifiedImageData = base64Image.replace('data:image/jpeg;base64,', '');
    const request = {
        image: {
            content: modifiedImageData
        },
        features: [
            { type: 'LOGO_DETECTION' },
        ],
    };

    try {
        const [result] = await visionClient.annotateImage(request);
        const aiResponse = result.logoAnnotations.map(annotation => annotation.description);
        return aiResponse;
    } catch (error) {
        console.error('Error detecting logos:', error.message);
    }
}

module.exports = {
    getImageData
};