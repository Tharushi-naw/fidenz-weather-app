const express = require("express");
const app = express();
const PORT = 5000;

app.get("/",(req,res) =>{
    res.send("Fidenz Weather API is running")
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});

app.get("/api/status", (req, res) => {
    res.json({
        message: "Weather API is working",
        status: "success"
    });
});