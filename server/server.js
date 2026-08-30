require("dotenv").config();

const express = require("express");
const citiesData = require("./data/cities.json");

const app = express();
const PORT = 5000;

const cities = citiesData.List;
const cityCodes = cities.map(city => city.CityCode);

async function fetchWeather(cityCode) {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const url =
        `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Weather request failed with status ${response.status}`
        );
    }

    const weatherData = await response.json();

    return weatherData;
}

function formatWeatherData(weatherData) {
    return {
        cityCode: weatherData.id,
        cityName: weatherData.name,
        description: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        cloudiness: weatherData.clouds.all
    };
}

app.get("/", (req, res) => {
    res.send("Fidenz Weather API is running");
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
        const cityCode = cityCodes[0];

        const weatherData = await fetchWeather(cityCode);

        res.json(weatherData);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch weather data"
        });
    }
});

app.get("/api/weather", async (req, res) => {
    try {
        const weatherPromises = cityCodes.map(cityCode => {
            return fetchWeather(cityCode);
        });

        const weatherResults = await Promise.all(weatherPromises);

        const formattedWeather = weatherResults.map(weatherData => {
            return formatWeatherData(weatherData);
        });

        res.json({
            count: formattedWeather.length,
            cities: formattedWeather
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch weather data"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});