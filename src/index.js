// activate dotenv
require('dotenv').config();
// {path: __dirname + '/.env'};

// enable connection
require("./app/Config/database").connect();

// import modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
let routes = require("./app/routes/routes");

// defining the Express app
const app = express();

// set port 
const port = process.env.PORT || 4000;

// enabling CORS for all requests
app.use(cors());

// enabling helmet for additional layer of security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// enable session for authentication
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());
  

// defining an endpoint to return all controllers
routes(app);

// starting the server
app.listen(port, () => {
    console.log(`SERVER RUNNING 0N ${port} `);
});