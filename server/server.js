require("dotenv").config();

const express = require("express");
const citiesData = require("./data/cities.json");

const app = express();
const PORT = 5000;

const cities = citiesData.List;
const cityCodes = cities.map(city => city.CityCode);

app.get("/",(req,res) =>{
    res.send("Fidenz Weather API is running")
});

app.get("/api/status", (req, res) => {
    res.json({
        message: "Weather API is working",
        status: "success"
    });
});

app.get("/api/cities", (req, res) => {
    res.json({
        count: cities.length,
        cityCodes: cityCodes
    });
});

app.get("/api/weather/test", async (req, res) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const cityCode = cityCodes[0];

        const url =
            `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${apiKey}&units=metric`;

        const response = await fetch(url);

        const weatherData = await response.json();

        res.json(weatherData);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch weather data"
        });
    }
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});