# front10-test
## About

Flights Finder Service.
Given an origin, destination, date, category and travelers search for matching flights in the Database.
Also given depart and return dates can find round-trip flights.

## Technologies
A little bit of what's inside the project:
- **Node.js** and **Express** to create the server and handle routes, requests and responses.
- **express-validator** to clean and validate the input data.
- **Mongoose** to persist all the data.

## Endpoints:

Endpoints | Description | Params
----------|-------------|-------------
POST `/travels/flight/` | Create a new flight | Example Params via body
`{"airline": "Fly-Emirates","origin": "Miami","destination": "Havana","date": "2023-03-05","categoriesAndVacancies": {"category": "Bussiness","adults":20}}`
GET `/travels/flight/one-way` | Return all flights from origin to destination matching all params | Example Params via query: `origin=havana&destination=miami&date=2023-02-12&category=Bussiness&adults=3`

GET `travels/flight/round-trip` | Return all flights from origin to destination matching all params | Example Params via query:
`origin=havana&destination=miami&departDate=2023-02-12&returnDate=2023-03-05&category=Bussiness&adults=3`


## How to use:
Be sure to change the `uri` variable in `database.js` according to your own MongoDB server. It's also possible to just create a `.env` file and store this information there in order to keep it hidden and safe. Then, just run on terminal:
```
npm install
npm start
```


