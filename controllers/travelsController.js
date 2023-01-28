
const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

//Schemas needed for creating Models
const flightSchema = require('../models/travelsModel').flightSchema;
const categoryAndVacanciesSchema = require('../models/travelsModel').categoryAndVacanciesSchema;

//Required Models for Database managment
const flightModel = mongoose.model('Flights', flightSchema);
const categoriesAndvacanciesModel = mongoose.model('CategoriesAndVacancies', categoryAndVacanciesSchema);

/* 
Register new flights into the Database after some validations.
The flight data and the vacancies and categories are saved in different collections.
Finally redirects user to origin.
*/
const postFlight = async (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length === 0) {
        const { airline, origin, destination, date, categoriesAndVacancies } = req.body;
        try {
            const flightDoc = flightModel({
                airline: airline,
                origin: origin,
                destination: destination,
                date: date
            });
            const savedFlight = await flightDoc.save();
            const flightId = savedFlight._id.toString();
            let catAndVacDoc;
            await categoriesAndVacancies.forEach(async catAndVac => {
                catAndVacDoc = categoriesAndvacanciesModel({
                    flightId: flightId,
                    category: catAndVac.category.trim().toLowerCase(),
                    adults: catAndVac.adults !== undefined ? catAndVac.adults : 0,
                    students: catAndVac.students !== undefined ? catAndVac.students : 0,
                    seniors: catAndVac.seniors !== undefined ? catAndVac.seniors : 0,
                    youths: catAndVac.youths !== undefined ? catAndVac.youths : 0,
                    children: catAndVac.children !== undefined ? catAndVac.children : 0,
                    toddlersOwnSeat: catAndVac.toddlersOwnSeat !== undefined ? catAndVac.toddlersOwnSeat : 0,
                    infantsInLap: catAndVac.infantsInLap !== undefined ? catAndVac.infantsInLap : 0
                });
                await catAndVacDoc.save();
            });
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    } else {
        console.error('Validation errors:', errors);
        res.status(400).json({ validationErrors: errors });
    }
};

/*
 Returns in a JSON information about a flight using parameters via query.
 Uses findFlight function to find the information after some validations. 
*/
const getFlightsOneWay = async (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length === 0) {
        try {
            findFlights(req.query).then((flightsPromises) => {
                Promise.all(flightsPromises).then((flights) => {
                    res.json(flights);
                });
            });
        } catch (error) {
            next(error);
        }
    } else {
        console.error('Validation errors:', errors);
        res.status(400).json({ validationErrors: errors });
    }
};

/*
 Returns in a JSON information about a depart flight and a return flight using parameters via query.
 Uses findFlight function for both flights separately to find all the information after some validations.
 For the return flight origin is the destination parameter and viceversa
*/
const getFlightsRoundTrip = async (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length === 0) {
        let {
            origin,
            destination,
            departDate,
            returnDate,
            category,
            adults,
            students,
            seniors,
            youths,
            children,
            toddlersOwnSeat,
            infantsInLap
        } = req.query;
        const departQuery = {
            origin: origin,
            destination: destination,
            date: departDate,
            category: category,
            adults: adults,
            students: students,
            seniors: seniors,
            youths: youths,
            children: children,
            toddlersOwnSeat: toddlersOwnSeat,
            infantsInLap: infantsInLap
        };
        const returnQuery = {
            origin: destination,
            destination: origin,
            date: returnDate,
            category: category,
            adults: adults,
            students: students,
            seniors: seniors,
            youths: youths,
            children: children,
            toddlersOwnSeat: toddlersOwnSeat,
            infantsInLap: infantsInLap
        };
        try {
            let departFlights;
            let returnFlights;
            findFlights(departQuery).then(async (flightsPromises) => {
                departFlights = await Promise.all(flightsPromises);
                findFlights(returnQuery).then(async (flightsPromises) => {
                    returnFlights = await Promise.all(flightsPromises);
                    res.json({
                        departFlights: departFlights,
                        returnFligths: returnFlights
                    });
                });
            });
        } catch (error) {
            next(error);
        }
    } else {
        console.error('Validation errors:', errors);
        res.status(400).json({ validationErrors: errors });
    }
};

/* 
Given some parameters checks Database for possible flights that matches parameters.
After some validations searchs for the flight info and then for all categories and vacancies for the flight
Returns the Flight Object Promise that should contain all the information about the flight 
*/
async function findFlights(query) {
    let {
        origin,
        destination,
        date,
        category,
        adults,
        students,
        seniors,
        youths,
        children,
        toddlersOwnSeat,
        infantsInLap
    } = query;

    if (adults || students || seniors || youths ||
        children || toddlersOwnSeat || infantsInLap) {

        adults = adults !== undefined ? adults : 0;
        students = students !== undefined ? students : 0;
        seniors = seniors !== undefined ? seniors : 0;
        youths = youths !== undefined ? youths : 0;
        children = children !== undefined ? children : 0;
        toddlersOwnSeat = toddlersOwnSeat !== undefined ? toddlersOwnSeat : 0;
        infantsInLap = infantsInLap !== undefined ? infantsInLap : 0;

        const flights = await flightModel.find({
            origin: origin,
            destination: destination,
            date: date
        }).select('_id airline origin destination date').exec();

        if (flights.length > 0) {
            let findConditions = {
                category: category,
                adults: { $gte: adults },
                students: { $gte: students },
                seniors: { $gte: seniors },
                youths: { $gte: youths },
                children: { $gte: children },
                toddlersOwnSeat: { $gte: toddlersOwnSeat },
                infantsInLap: { $gte: infantsInLap }
            };
            let flightsWithCategoriesPromises = flights.map((flight) => {
                findConditions.flightId = flight._id.toString();
                return categoriesAndvacanciesModel
                    .find(findConditions)
                    .select('adults students seniors youths children toddlersOwnSeat infantsInLap')
                    .exec().then((vacancies) => {
                        return {
                            airline: flight.airline,
                            origin: flight.origin,
                            destination: flight.destination,
                            category: category,
                            vacancies: vacancies[0]
                        };
                    })
            });
            return flightsWithCategoriesPromises;
        } else {
            return {};
        }
    } else {
        throw new Error('Must be at least 1 traveler');
    }
}

/* 
Validates parameters for a given method
*/
const validate = (method) => {
    switch (method) {
        case 'postFlight': return [
            body('airline')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Airline  is required!'),
            body('origin')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Origin is required!'),
            body('destination')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Destination is required!'),
            body('date')
                .exists()
                .isDate()
                .toDate()
                .withMessage('Valid Date is required!'),
            body('categoriesAndVacancies')
                .exists()
                .notEmpty()
                .toArray()
                .withMessage('An array is required')
        ];

        case 'getFlightsOneWay': return [
            query('origin')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Origin is required!'),
            query('destination')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Destination is required!'),
            query('date')
                .exists()
                .isDate()
                .toDate()
                .withMessage('Valid Date is required!'),
            query('category')
                .exists()
                .isString()
                .trim()
                .toLowerCase()
                .withMessage('Category is required!'),
            query('adults')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Adults field must be an integer greater than 0!'),
            query('students')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Students field must be an integer greater than 0!'),
            query('seniors')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Seniors field must be an integer greater than 0!'),
            query('youths')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Youths field must be an integer greater than 0!'),
            query('children')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Children field must be an integer greater than 0!'),
            query('toddlersOwnSeat')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Toddlers field must be an integer greater than 0!'),
            query('infantsInLap')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Infants field must be an integer greater than 0!')
        ];

        case 'getFlightsRoundTrip': return [
            query('origin')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Origin is required!'),
            query('destination')
                .exists()
                .isString()
                .toLowerCase()
                .trim()
                .withMessage('Destination is required!'),
            query('departDate')
                .exists()
                .isDate()
                .toDate()
                .withMessage('Valid Departure Date is required!'),
            query('returnDate')
                .exists()
                .isDate()
                .toDate()
                .withMessage('Valid Return Date is required!'),
            query('category')
                .exists()
                .isString()
                .trim()
                .toLowerCase()
                .withMessage('Category is required!'),
            query('adults')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Adults field must be an integer greater than 0!'),
            query('students')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Students field must be an integer greater than 0!'),
            query('seniors')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Seniors field must be an integer greater than 0!'),
            query('youths')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Youths field must be an integer greater than 0!'),
            query('children')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Children field must be an integer greater than 0!'),
            query('toddlersOwnSeat')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Toddlers field must be an integer greater than 0!'),
            query('infantsInLap')
                .optional()
                .isInt()
                .toInt()
                .withMessage('Infants field must be an integer greater than 0!')
        ];

        default: return [];
    }
};

module.exports = {
    postFlight,
    getFlightsOneWay,
    getFlightsRoundTrip,
    validate: validate
};