// activate dotenv
require('dotenv').config();
// {path: __dirname + '/.env'};

// enable connection
require("./app/Config/database").connect();

// import modules
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
let routes = require("./app/routes/routes");

// defining the Express app
const app = express();

// set port 
const port = process.env.PORT || 4000;

// enabling CORS for all requests
app.use(cors());

// enabling helmet for additional layer of security
app.use(helmet());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// defining an endpoint to return all controllers
routes(app);

// starting the server
app.listen(port, () => {
    console.log(`SERVER RUNNING 0N ${port} `);
});