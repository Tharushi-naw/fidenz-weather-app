function clampScore(score) {
    return Math.max(0, Math.min(100, score));
}

function calculateComfortIndex(
    temperature,
    humidity,
    windSpeed,
    visibility = 10000
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

    const visibilityScore = clampScore(
        ( visibility / 10000) * 100
    )

    const comfortScore =
        temperatureScore * 0.45 +
        humidityScore * 0.25 +
        windScore * 0.20 + 
        visibilityScore * 0.10

    return Math.round(comfortScore);
}

module.exports = {
    clampScore,
    calculateComfortIndex
};