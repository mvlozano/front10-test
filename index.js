const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const connectToDB = require('./database/database');
const router = require('./routes/travelsRouter');
require('dotenv').config();

//Port for listening to
const PORT = process.env.PORT || 3000;

//Middlewares
//Serves satic files
app.use(express.static(__dirname + '/public'));
//Allows cross origin resource sharing
app.use(cors());
//Parses request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Routing
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`);
});

app.use('/travels',router);


// Not found middleware
app.use((req, res, next) => {
    res.sendFile(`${__dirname}/views/404.html`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    let errCode, errMessage;

    if (err.errors) {
        // mongoose validation error
        errCode = 400; // bad request
        const keys = Object.keys(err.errors);
        // report the first validation error
        errMessage = err.errors[keys[0]].message;
    } else {
        // generic or custom error
        errCode = err.status || 500;
        errMessage = err.message || 'Internal Server Error';
    }

    res.status(errCode).type('txt')
        .send(errMessage);
});

//On successful connection to DataBase the server starts listening for requests
connectToDB().then(() => {
    console.log('Successfully connected to Database');
    app.listen(PORT, () => {
        console.log('Server listening on port:', PORT);
    });
}).catch((error) => {
    console.error('Database connection error', error);
})


