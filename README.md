# Weather Comfort Analytics Dashboard

A full-stack weather analytics application that retrieves current weather data for multiple cities, calculates a custom Comfort Index, ranks cities from most comfortable to least comfortable, and displays the results in a responsive React dashboard.

The application uses React for the frontend, Node.js and Express for the backend, OpenWeatherMap for live weather data, and Auth0 for authentication and authorization.

---

## Features

- Fetches live weather data from OpenWeatherMap
- Processes weather information for 10 cities
- Calculates a Comfort Index from 0 to 100
- Ranks cities from most comfortable to least comfortable
- Responsive desktop, tablet, and mobile interface
- 5-minute server-side weather cache
- Cache HIT/MISS debugging information
- Auth0 login and logout
- Multi-factor authentication
- Public signup disabled
- Authenticated-only dashboard
- Protected backend weather API
- Unit tests for Comfort Index logic

---

## Technology Stack

### Frontend

- React
- Vite
- CSS
- Auth0 React SDK

### Backend

- Node.js
- Express.js
- OpenWeatherMap API
- Auth0 JWT validation
- In-memory caching

### Testing

- Node.js built-in test runner
- Node Assert

---

## Project Structure

```text
fidenz-weather-app/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
├── server/
│   ├── data/
│   │   └── cities.json
│   │
│   ├── tests/
│   │   └── comfort.test.js
│   │
│   ├── utils/
│   │   └── comfort.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

# Comfort Index

The Comfort Index is calculated on the backend and produces a score between:

```text
0   = Least Comfortable
100 = Most Comfortable
```

The current calculation uses three weather parameters:

1. Temperature
2. Humidity
3. Wind speed

Each parameter is converted into an individual score between 0 and 100 before being combined into the final Comfort Index.

---

## Temperature Score

The preferred temperature is considered to be approximately:

```text
22°C
```

The further the current temperature moves away from 22°C, the lower the temperature comfort score becomes.

The formula is:

```text
Temperature Score =
100 - |Temperature - 22| × 5
```

The result is restricted to the range 0–100.

For example, a temperature close to 22°C receives a high score, while temperatures that are significantly hotter or colder receive a lower score.

---

## Humidity Score

The preferred relative humidity is considered to be approximately:

```text
50%
```

The humidity score is calculated using:

```text
Humidity Score =
100 - |Humidity - 50| × 2
```

The result is restricted to the range 0–100.

Humidity close to 50% receives a higher score, while very high or very low humidity reduces the comfort level.

---

## Wind Score

A light wind of approximately:

```text
2 m/s
```

is treated as the preferred value.

The wind score is calculated using:

```text
Wind Score =
100 - |Wind Speed - 2| × 10
```

The result is restricted to the range 0–100.

Moderate wind receives a higher score while wind speeds significantly different from the preferred value reduce the score.

---

## Final Comfort Score

The three individual scores use different weights:

```text
Temperature = 50%
Humidity    = 30%
Wind Speed  = 20%
```

The final Comfort Index formula is:

```text
Comfort Index =
(Temperature Score × 0.50)
+
(Humidity Score × 0.30)
+
(Wind Score × 0.20)
```

The final result is rounded to the nearest whole number.

Temperature receives the highest weighting because very hot or very cold temperatures have a significant impact on outdoor comfort.

Humidity receives the second-highest weighting because very high or very low humidity can make otherwise reasonable temperatures feel uncomfortable.

Wind speed receives a smaller weighting because moderate wind can improve comfort, while stronger wind can make conditions less comfortable.

---

# Score Boundaries

Every individual score is restricted to the range:

```text
0 to 100
```

This is handled using a helper function:

```javascript
function clampScore(score) {
    return Math.max(0, Math.min(100, score));
}
```

This prevents the algorithm from producing values below 0 or above 100.

---

# City Ranking

After calculating the Comfort Index for every city, the backend sorts the cities in descending order.

```text
Highest Comfort Score
        ↓
Lowest Comfort Score
```

The backend then assigns a rank to each city.

Example:

```text
#1  City A    92
#2  City B    86
#3  City C    78
```

The ranking is calculated on the backend instead of the frontend so that the application's business logic remains centralized.

---

# Weather Data

Weather information is retrieved from the OpenWeatherMap Current Weather API.

The backend processes the following information:

- City ID
- City name
- Weather description
- Temperature
- Humidity
- Wind speed
- Atmospheric pressure
- Visibility
- Cloudiness

The current Comfort Index uses:

- Temperature
- Humidity
- Wind speed

Other weather values are retained so the system can be extended later.

---

# Cities

The application processes at least 10 cities using OpenWeatherMap city IDs.

The city information is stored inside:

```text
server/data/cities.json
```

The backend reads the city codes from this file and retrieves current weather information for each configured city.

Weather requests for multiple cities are performed concurrently using:

```javascript
Promise.all()
```

This allows the backend to request weather information for multiple cities without waiting for each request to complete sequentially.

---

# Server-Side Caching

To reduce unnecessary requests to OpenWeatherMap, raw API responses are cached on the server.

The cache duration is:

```text
5 minutes
```

which is equivalent to:

```text
300 seconds
```

The cache is implemented using a JavaScript:

```javascript
Map
```

The OpenWeatherMap CityCode is used as the cache key.

Each cache entry contains:

```text
Weather API response
Timestamp
```

The request process works as follows:

```text
Weather request
      ↓
Check server cache
      ↓
Is valid cached data available?
      ↓
   Yes / No
    ↓     ↓
   HIT   MISS
    ↓     ↓
Return   Request data from
cached   OpenWeatherMap
data          ↓
              ↓
         Save response
         in cache
              ↓
         Return response
```

If cached data exists and is less than five minutes old, the backend returns the cached response.

If the data is missing or expired, the backend requests fresh weather information from OpenWeatherMap and stores the new raw response in the cache.

The current cache is stored in application memory.

This means the cache is cleared whenever the Node.js server restarts.

For a larger production system, a distributed caching solution such as Redis could be used.

---

# Cache Debug Endpoint

The backend provides a cache debugging endpoint:

```http
GET /api/cache/status
```

The endpoint provides information about the cache state for each city.

Information includes:

- Last request status
- Current cache state
- Cache age
- Remaining cache lifetime

Example:

```json
{
    "lastRequestStatus": "HIT",
    "currentCacheState": "HIT",
    "ageSeconds": 120,
    "expiresInSeconds": 180
}
```

A `HIT` means valid cached weather information was available.

A `MISS` means fresh information had to be requested from OpenWeatherMap.

---

# Authentication and Authorization

Authentication and authorization are implemented using Auth0.

The application supports:

- User login
- User logout
- Multi-factor authentication
- Public signup disabled
- Authenticated-only weather dashboard
- Protected backend API routes

After a user successfully logs in, the React application requests an Auth0 access token.

The token is sent to the Express backend using an HTTP Authorization header:

```text
Authorization: Bearer <access-token>
```

The backend validates the access token before allowing access to protected endpoints.

The authentication flow is:

```text
User
 ↓
React Application
 ↓
Auth0 Login
 ↓
MFA
 ↓
Auth0 Access Token
 ↓
React sends Bearer token
 ↓
Express backend
 ↓
JWT validation
 ↓
Protected weather data
```

An unauthenticated request behaves like:

```text
Unauthenticated request
        ↓
GET /api/weather
        ↓
No valid access token
        ↓
401 Unauthorized
```

An authenticated request behaves like:

```text
Authenticated React application
        ↓
Obtains Auth0 access token
        ↓
Sends Bearer token
        ↓
Express validates token
        ↓
Weather data returned
```

---

# API Endpoints

## Public Endpoints

### Root Endpoint

```http
GET /
```

Returns a basic response confirming that the backend is running.

Example:

```text
Fidenz Weather API is running
```

---

### API Status

```http
GET /api/status
```

This endpoint is intentionally public and can be used to confirm that the backend server is running correctly.

Example response:

```json
{
    "message": "Weather API is working",
    "status": "success"
}
```

---

# Protected Endpoints

The following endpoints require a valid Auth0 access token.

---

## City Codes

```http
GET /api/cities
```

Returns the configured city codes.

---

## Test Weather Request

```http
GET /api/weather/test
```

Retrieves weather data for one test city.

This endpoint was useful during development when initially connecting the backend to OpenWeatherMap.

---

## Ranked Weather Data

```http
GET /api/weather
```

This is the main weather endpoint.

It:

1. Retrieves weather information for the configured cities.
2. Uses cached responses when available.
3. Formats the OpenWeatherMap responses.
4. Calculates a Comfort Index.
5. Sorts cities by Comfort Index.
6. Assigns each city a rank.
7. Returns the ranked results to the frontend.

---

## Cache Status

```http
GET /api/cache/status
```

Returns information about server-side cache HIT/MISS status and cache expiration.

---

# Environment Variables

Environment variables are used so that sensitive configuration values are not hard-coded into the application.

---

## Backend Environment Variables

Create:

```text
server/.env
```

Example:

```env
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
AUTH0_AUDIENCE=https://fidenz-weather-api
```

The Auth0 domain should be entered without:

```text
https://
```

For example:

```text
dev-example.us.auth0.com
```

instead of:

```text
https://dev-example.us.auth0.com
```

---

## Frontend Environment Variables

Create:

```text
client/.env
```

Example:

```env
VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://fidenz-weather-api
```

The actual environment variable values are not committed to Git.

---

# Git Security

The project uses a `.gitignore` file to prevent sensitive and unnecessary files from being committed.

Important ignored files include:

```text
server/node_modules/
client/node_modules/
server/.env
client/.env
.env
```

API keys, access tokens, passwords, Auth0 secrets, MFA secrets, and other sensitive information should never be committed to the repository.

---

# Installation

## Prerequisites

Before running the project, install:

- Node.js
- npm
- Git

An OpenWeatherMap API key and Auth0 configuration are also required.

---

## 1. Clone the Repository

Clone the project:

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd fidenz-weather-app
```

---

# Backend Setup

Move into the backend directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create:

```text
server/.env
```

Add the required environment variables:

```env
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
AUTH0_AUDIENCE=https://fidenz-weather-api
```

Start the backend:

```bash
node server.js
```

The backend should run on:

```text
http://localhost:5000
```

A successful startup displays:

```text
Server running on http://localhost:5000
```

---

# Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create:

```text
client/.env
```

Add the required Auth0 environment variables:

```env
VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://fidenz-weather-api
```

Start the React application:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

---

# Running the Full Application

The frontend and backend must both be running.

Terminal 1:

```bash
cd server
node server.js
```

Terminal 2:

```bash
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

in a browser.

---

# Testing Authentication

The backend status endpoint can be opened directly:

```text
http://localhost:5000/api/status
```

It should return a success response.

The protected weather endpoint can also be opened directly:

```text
http://localhost:5000/api/weather
```

Because a normal browser address-bar request does not contain an Auth0 Bearer token, the expected response is:

```json
{
    "message": "Unauthorized. A valid access token is required."
}
```

After logging into the React application through Auth0, the dashboard can access the protected endpoint because React sends the Auth0 access token with the request.

---

# Unit Testing

The Comfort Index calculation is separated from the main Express server and stored in:

```text
server/utils/comfort.js
```

This separation makes the business logic easier to test independently.

The unit tests are located in:

```text
server/tests/comfort.test.js
```

The tests use the Node.js built-in test runner.

Run the tests from the server directory:

```bash
npm test
```

The current test suite checks:

- Normal score clamping
- Scores below zero
- Scores above 100
- Ideal weather conditions
- Comfort Index boundaries
- Comfortable conditions compared with uncomfortable conditions

Current result:

```text
tests 6
pass 6
fail 0
```

---

# Why the Comfort Logic Is Separated

The Comfort Index calculation is stored separately from `server.js`.

Instead of placing all logic inside one server file:

```text
server.js
├── API routes
├── Authentication
├── Caching
└── Comfort calculation
```

the application separates the Comfort Index logic:

```text
server.js
├── API routes
├── Authentication
└── Caching

utils/comfort.js
└── Comfort Index business logic
```

This provides better separation of concerns and allows the Comfort Index to be unit-tested without starting the Express server.

---

# Responsive Design

The dashboard is designed to work on desktop, tablet, and mobile devices.

The layout changes depending on screen size.

Desktop:

```text
3 weather cards per row
```

Tablet:

```text
2 weather cards per row
```

Mobile:

```text
1 weather card per row
```

CSS media queries are used to adjust the layout for different screen sizes.

The authentication interface is also responsive.

---

# Dashboard Information

Each weather card displays information including:

- Rank
- City name
- Weather description
- Temperature
- Humidity
- Wind speed
- Comfort Index score
- Visual Comfort Index progress bar

Cities are displayed from the highest Comfort Index to the lowest.

---

# Error Handling

The application includes basic error handling for:

- Failed OpenWeatherMap requests
- Missing OpenWeatherMap API key
- Unauthorized backend requests
- Failed frontend weather requests
- Authentication errors

The React interface displays an error message if weather information cannot be loaded.

---

# Security

The application follows several security practices.

These include:

- OpenWeatherMap API key stored in environment variables
- Auth0 configuration stored in environment variables
- `.env` files excluded from Git
- Protected weather API routes
- JWT access token validation
- Public signup disabled
- Multi-factor authentication enabled
- Authentication required before viewing the dashboard
- No Auth0 client secret stored in the React application

---

# Current Architecture

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  React Frontend │
                         │ localhost:5173  │
                         └────────┬────────┘
                                  │
                           Auth0 Login/MFA
                                  │
                                  ▼
                         ┌─────────────────┐
                         │      Auth0      │
                         └────────┬────────┘
                                  │
                             Access Token
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Express Backend │
                         │ localhost:5000  │
                         └────────┬────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
                     ▼                         ▼
              ┌─────────────┐          ┌────────────────┐
              │ Memory Cache│          │ OpenWeatherMap │
              │ 5-minute TTL│          │      API       │
              └─────────────┘          └────────────────┘
```

---

# Possible Future Improvements

Possible improvements for a production-scale version include:

- Redis-based distributed caching
- Database persistence
- Additional Comfort Index parameters
- More advanced weather visualizations
- Automated integration testing
- Configurable city management
- Cloud deployment
- Application logging and monitoring
- API rate limiting
- Improved error handling
- TypeScript support
- Containerization with Docker
- Automated CI/CD pipeline

---

# Live Extension Possibility

The weather response already contains additional weather information such as:

```text
Visibility
Pressure
Cloudiness
```

These values are currently available but are not included in the Comfort Index calculation.

This makes the system easy to extend by adding another weather parameter to the Comfort Index in the future.

---

# Summary

The Weather Comfort Analytics Dashboard demonstrates a complete full-stack workflow including:

```text
React frontend
      ↓
Auth0 authentication
      ↓
Protected Express API
      ↓
Server-side caching
      ↓
OpenWeatherMap
      ↓
Comfort Index calculation
      ↓
City ranking
      ↓
Responsive dashboard
```

The application keeps weather processing, Comfort Index calculation, authentication, API security, caching, and frontend presentation separated into clear responsibilities.

---
