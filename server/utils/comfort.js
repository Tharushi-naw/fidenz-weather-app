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

module.exports = {
    clampScore,
    calculateComfortIndex
};