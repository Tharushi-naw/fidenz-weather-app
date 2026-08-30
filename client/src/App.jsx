import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";

function App() {
    const {
        isAuthenticated,
        isLoading: authLoading,
        loginWithRedirect,
        logout,
        user,
        getAccessTokenSilently
    } = useAuth0();

    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            setCities([]);
            setLoading(false);
            setError("");
            return;
        }

        async function loadWeather() {
            try {
                setLoading(true);
                setError("");

                // Get a valid Auth0 access token
                const accessToken = await getAccessTokenSilently();

                // Send the access token to the protected Express API
                const response = await fetch(
                    "http://localhost:5000/api/weather",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Unable to load weather data. Status: ${response.status}`
                    );
                }

                const data = await response.json();

                setCities(data.cities);
            } catch (error) {
                console.error("Weather request failed:", error);

                setError(
                    "Unable to load weather information."
                );
            } finally {
                setLoading(false);
            }
        }

        loadWeather();
    }, [isAuthenticated, getAccessTokenSilently]);

    // Auth0 is still checking whether the user is logged in
    if (authLoading) {
        return (
            <main className="page">
                <p className="status-message">
                    Checking authentication...
                </p>
            </main>
        );
    }

    // User is not logged in
    if (!isAuthenticated) {
        return (
            <main className="login-page">
                <section className="login-card">
                    <p className="eyebrow">
                        Weather Analytics
                    </p>

                    <h1>
                        Comfort Index Dashboard
                    </h1>

                    <p className="login-description">
                        Sign in to access the weather comfort
                        rankings.
                    </p>

                    <button
                        className="login-button"
                        onClick={() =>
                            loginWithRedirect()
                        }
                    >
                        Log in
                    </button>
                </section>
            </main>
        );
    }

    // User is logged in, but weather is loading
    if (loading) {
        return (
            <main className="page">
                <p className="status-message">
                    Loading weather data...
                </p>
            </main>
        );
    }

    // Weather request failed
    if (error) {
        return (
            <main className="page">
                <p className="error-message">
                    {error}
                </p>
            </main>
        );
    }

    // Logged-in dashboard
    return (
        <main className="page">
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <p className="eyebrow">
                            Weather Analytics
                        </p>

                        <h1>
                            Comfort Index Dashboard
                        </h1>

                        <p className="subtitle">
                            Cities ranked from most comfortable
                            to least comfortable using current
                            weather conditions.
                        </p>
                    </div>

                    <div className="user-actions">
                        {user?.email && (
                            <span className="user-email">
                                {user.email}
                            </span>
                        )}

                        <button
                            className="logout-button"
                            onClick={() =>
                                logout({
                                    logoutParams: {
                                        returnTo:
                                            window.location.origin
                                    }
                                })
                            }
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <section className="weather-grid">
                {cities.map((city) => (
                    <article
                        className="weather-card"
                        key={city.cityCode}
                    >
                        <div className="card-top">
                            <span className="rank">
                                #{city.rank}
                            </span>

                            <span className="score">
                                {city.comfortScore}/100
                            </span>
                        </div>

                        <h2>
                            {city.cityName}
                        </h2>

                        <p className="description">
                            {city.description}
                        </p>

                        <p className="temperature">
                            {city.temperature.toFixed(1)}°C
                        </p>

                        <div className="weather-details">
                            <div>
                                <span>
                                    Humidity
                                </span>

                                <strong>
                                    {city.humidity}%
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Wind
                                </span>

                                <strong>
                                    {city.windSpeed} m/s
                                </strong>
                            </div>
                        </div>

                        <div className="comfort-section">
                            <div className="comfort-heading">
                                <span>
                                    Comfort Index
                                </span>

                                <strong>
                                    {city.comfortScore}
                                </strong>
                            </div>

                            <div className="comfort-bar">
                                <div
                                    className="comfort-fill"
                                    style={{
                                        width:
                                            `${city.comfortScore}%`
                                    }}
                                />
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default App;