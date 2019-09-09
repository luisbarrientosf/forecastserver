This project was realized as a technical test.

# Overview

The main goal of this technical test is to create an App capable of display the forecast of 6 cities.

The complete project has two related repositories.
- App ([Link to repository](https://github.com/luisbarrientosf/ripleyforecastapp))
- Server (This Repository)

## Technologies

- React
- Node.js
- Redis
- Socket.io
- Heroku

## Features

- Sockets comunnication between Server and App
- The Server has to simulate 10% error when receiving a request.
- The App has to catch these errors and replay request when is necessary.
- Forecast Data is fetched from [Dark Sky API](https://darksky.net/dev)
- Data storage using Redis.

## Demo Links

- https://ripleyforecastapp.herokuapp.com/
