# Re-Vision Search Engine Service
## Description

Re-Vision is a search service built using Node.js to support the Re-Vision front end app. It uses a variety of dependencies to provide AI image analysis capabilities and connect to the central recycling database for enabling search.

## Prerequisites

Before you begin, ensure that you have the following software installed on your system:

1. **Node.js**: Version 20 or higher
   - You can download Node.js from the official website: [Node.js Downloads](https://nodejs.org/en/download)

2. **npm (Node Package Manager)**: Version 10 or higher
   - npm is bundled with Node.js. After installing Node.js, you should automatically have npm available.

To verify your installations, open a terminal or command prompt and run the following commands:

```bash
node -v
npm -v
```

## Installation

1. Clone this repository.
   ```bash
   git clone https://github.com/samuel-manners/revisionSeachEngine.git
   ```
   
3. Install the required dependencies using npm:

   ```bash
   npm install
   ```

## Dependencies
- @google-cloud/vision: Provides access to Google Cloud Vision API for image analysis.
- body-parser: For parsing request bodies.
- dotenv: Loads environment variables from a .env file.
- express: Web framework for handling HTTP requests.
- mysql2: MySQL database driver.
- redis: In-memory data store for caching.

## Usage
This Node.js API will create two endpoints for requests, one for recieving AI request and one for normal database search queries. This enables vision tools and database search tools to be handled by one singular central API enabling AI search through the main app.
