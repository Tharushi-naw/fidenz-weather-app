require("dotenv").config();

const express = require("express");
const cors = require("cors");
const citiesData = require("./data/cities.json");

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

const PORT = 5000;

const cities = citiesData.List;

const cityCodes = cities.map(city => city.CityCode);

const CACHE_TTL = 5 * 60 * 1000;

const weatherCache = new Map();

const cacheAccessStatus = new Map();

async function fetchWeather(cityCode) {
    const cacheKey = String(cityCode);

    const cachedItem = weatherCache.get(cacheKey);

    const currentTime = Date.now();

    if (
        cachedItem &&
        currentTime - cachedItem.timestamp < CACHE_TTL
    ) {
        cacheAccessStatus.set(cacheKey, "HIT");

        return cachedItem.data;
    }

    if (cachedItem) {
        weatherCache.delete(cacheKey);
    }


    cacheAccessStatus.set(cacheKey, "MISS");


    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        throw new Error("OPENWEATHER_API_KEY is missing");
    }


    const url =
        `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${apiKey}&units=metric`;


    const response = await fetch(url);


    if (!response.ok) {
        throw new Error(
            `Weather request failed with status ${response.status}`
        );
    }


    const weatherData = await response.json();

    weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
    });


    return weatherData;
}

function clampScore(score) {
    return Math.max(0, Math.min(100, score));
}

function calculateComfortIndex(
    temperature,
    humidity,
    windSpeed
) {
    const temperatureScore = clampScore(
        100 - Math.abs(temperature - 22) * 5
    );


    const humidityScore = clampScore(
        100 - Math.abs(humidity - 50) * 2
    );


    const windScore = clampScore(
        100 - Math.abs(windSpeed - 2) * 10
    );


    const comfortScore =
        temperatureScore * 0.5 +
        humidityScore * 0.3 +
        windScore * 0.2;


    return Math.round(comfortScore);
}

function formatWeatherData(weatherData) {
    const temperature = weatherData.main.temp;

    const humidity = weatherData.main.humidity;

    const windSpeed = weatherData.wind.speed;


    const comfortScore = calculateComfortIndex(
        temperature,
        humidity,
        windSpeed
    );


    return {
        cityCode: weatherData.id,
        cityName: weatherData.name,
        description: weatherData.weather[0].description,
        temperature: temperature,
        humidity: humidity,
        windSpeed: windSpeed,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility,
        cloudiness: weatherData.clouds.all,
        comfortScore: comfortScore
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
        console.error(error);

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


        const weatherResults =
            await Promise.all(weatherPromises);


        const formattedWeather = weatherResults.map(
            weatherData => {
                return formatWeatherData(weatherData);
            }
        );


        const sortedWeather = formattedWeather.sort(
            (a, b) => {
                return b.comfortScore - a.comfortScore;
            }
        );


        const rankedWeather = sortedWeather.map(
            (city, index) => {
                return {
                    ...city,
                    rank: index + 1
                };
            }
        );


        res.json({
            count: rankedWeather.length,
            cities: rankedWeather
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch weather data"
        });
    }
});

app.get("/api/cache/status", (req, res) => {
    const currentTime = Date.now();


    const cacheStatus = cities.map(city => {
        const cacheKey = String(city.CityCode);

        const cachedItem = weatherCache.get(cacheKey);


        let currentCacheState = "MISS";

        let ageSeconds = null;

        let expiresInSeconds = 0;


        if (cachedItem) {
            const age =
                currentTime - cachedItem.timestamp;


            if (age < CACHE_TTL) {
                currentCacheState = "HIT";

                ageSeconds =
                    Math.floor(age / 1000);

                expiresInSeconds =
                    Math.ceil(
                        (CACHE_TTL - age) / 1000
                    );
            }
        }


        return {
            cityCode: city.CityCode,
            cityName: city.CityName,

            lastRequestStatus:
                cacheAccessStatus.get(cacheKey) || "MISS",

            currentCacheState:
                currentCacheState,

            ageSeconds:
                ageSeconds,

            expiresInSeconds:
                expiresInSeconds
        };
    });


    res.json({
        ttlSeconds: CACHE_TTL / 1000,
        cities: cacheStatus
    });
});


app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});