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

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});