const router = require('express').Router();
const travelsController = require('../controllers/travelsController');

//Request Handlers for each request method from controllers module
const postFlight = travelsController.postFlight;
const getFlightsOneWay = travelsController.getFlightsOneWay;
const getFlightsRoundTrip = travelsController.getFlightsRoundTrip;
const validate = travelsController.validate;

//Register new flight into Database
router.post('/flight', validate('postFlight'), postFlight);

//Returns all posible one-way fligths for the specified parameters via query
router.get('/flight/one-way', validate('getFlightsOneWay'), getFlightsOneWay);

//Returns all posible two-ways flights finding depart and return each one as a one-way trip
router.get('/flight/round-trip', validate('getFlightsRoundtrip'), getFlightsRoundTrip)


module.exports = router;