const appRoot = require('app-root-path');
const env = require(`${appRoot}/configs/env.js`);
const express = require('express');
const redis = require('redis');
const https = require('https');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, content-type, application/json, Authorization");
  next();
});

//REDIS
const client = redis.createClient(env.REDIS_URL);

//SOCKET
io.on("connection", socket => { 
  socket.on("get_data", () => {
    client.hgetall("forecasts", (err, obj) => io.sockets.emit("get_forecast_data", obj) );
  });
});

//REQUESTS
//Save cities coordintates from Frontend on Redis.
app.get("/init", (req, res, next) => {
  try {
    //Simulate 10% Error
    if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed');
   
    //Save latitude and longitude of each city on Redis
    const cities = req.query.cities.map((city, index) =>  JSON.parse(city));
    for (var i = 0; i < cities.length; i++) {
      client.set(`${cities[i].name}.coords`, `${cities[i].lat},${cities[i].lng}`, redis.print);
    }

    res.send(cities);
  } catch (error) {
    var infoError = {
      requestUrl: "/init",
      requestQuery: req.query
    }
    processError(error, infoError);
    next(error);
  }
});

//Update the forecast and time on Redis
app.get("/forecast", async (req, res, next) => {
  try {
    //Simulate 10% Error
    if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed');

    //Get latitude and longitude from Redis
    client.get(`${req.query.city}.coords`, (err, result) => {
      const url = `https://api.darksky.net/forecast/${env.DARKSKY_API_KEY}/${result}`;
      
      //Request to Forecast API
      https.get( url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => data += chunk);

        resp.on('end', () => {
          const { latitude, longitude, currently, error } = JSON.parse(data);

          if(error){
            //daily usage limit exceeded or maybe another
            throw new Error('Request to Forecast API Failed')
          }

          if(currently !== undefined){
            //Save forecast data on redis
            client.hmset("forecasts", `${latitude},${longitude}`, JSON.stringify(currently), () => {
              client.hgetall("forecasts", (err, obj) => io.sockets.emit("get_forecast_data", obj) );
            });
          }
          res.send({ currently });
        });

      }).on("error", (err) => {
        throw new Error('Request to Forecast API Failed')
      });
    });
  } catch (error) {
    var infoError = {
      requestUrl: "/forecast",
      requestQuery: req.query
    }
    processError(error, infoError);
    next(error);
  }
});

const processError = (error, data) => {
  //Save error on Redis
  if(error.toString() == 'Error: How unfortunate! The API Request Failed'){
    let saveError = { message: error.toString(), data };
    client.hmset("api.errors", Date.now(), JSON.stringify(saveError), redis.print);
  }
};

server.listen(env.PORT, () => console.log(`Server running on port: ${env.PORT}` ) );