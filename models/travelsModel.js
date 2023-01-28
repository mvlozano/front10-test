const mongoose = require('mongoose');

//Schema for the flight basic information
const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
});

//Schema for each category and it vacancies
const categoryAndVacanciesSchema = new mongoose.Schema({
    flightId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    adults: {
        type: Number,
        required: true,
        min: 0,
    },
    students: {
        type: Number,
        required: true,
        min: 0,
    },
    seniors: {
        type: Number,
        required: true,
        min: 0,
    },
    youths: {
        type: Number,
        required: true,
        min: 0,
    },
    children: {
        type: Number,
        required: true,
        min: 0,
    },
    toddlersOwnSeat: {
        type: Number,
        required: true,
        min: 0,
    },
    infantsInLap: {
        type: Number,
        required: true,
        min: 0,
    }
});

module.exports = {
    flightSchema,
    categoryAndVacanciesSchema
};
