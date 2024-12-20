class Weather {
    static CONDITIONS = {
        SUNNY: 'sunny',
        CLOUDY: 'cloudy',
        SNOWING: 'snowing',
        FOGGY: 'foggy',
        RAINY: 'rainy'
    };

    static async getByLocation(locationId) {
        const weatherData = await pool.query(
            'SELECT * FROM weather_conditions WHERE location_id = ?',
            [locationId]
        );
        
        return this.processWeatherData(weatherData);
    }

    static async getForecast(locationId, days = 5) {
        const forecast = await pool.query(
            'SELECT * FROM weather_forecast WHERE location_id = ? AND date <= DATE_ADD(NOW(), INTERVAL ? DAY)',
            [locationId, days]
        );

        return forecast.map(day => this.processWeatherData(day));
    }

    static processWeatherData(data) {
        return {
            temperature: data.temperature,
            conditions: data.conditions,
            windSpeed: data.wind_speed,
            visibility: data.visibility,
            snowHeight: data.snow_height,
            humidity: data.humidity,
            timestamp: data.timestamp
        };
    }

    static getWeatherImpact(conditions) {
        return {
            visibilityFactor: this.calculateVisibilityImpact(conditions.visibility),
            temperatureFactor: this.calculateTemperatureImpact(conditions.temperature),
            windFactor: this.calculateWindImpact(conditions.windSpeed),
            snowConditionFactor: this.calculateSnowImpact(conditions)
        };
    }
}

module.exports = Weather; 