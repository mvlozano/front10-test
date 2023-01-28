const mongoose = require('mongoose');
mongoose.set('strictQuery',true);
require('dotenv').config();

//MongoDB url to connect
const MONGO_URI = process.env.MONGO_URI;

//Connection method
const connectToMongoose = async () => {
    return mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = connectToMongoose;