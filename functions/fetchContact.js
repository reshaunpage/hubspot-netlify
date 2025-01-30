const axios = require("axios");

exports.handler = async (event) => {
    const contactId = event.queryStringParameters.contactId;

    if (!contactId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Contact ID is required." }),
        };
    }

    try {
        // Fetch contact details from HubSpot
        const hubspotApiUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,city`;
        const hubspotResponse = await axios.get(hubspotApiUrl, {
            headers: {
                Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
            },
        });

        const contact = hubspotResponse.data.properties;
        const city = contact.city || "New York"; // Default to NY if no city is found

        // Fetch weather data from OpenWeather API
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherApiUrl);

        const weatherData = weatherResponse.data;

        return {
            statusCode: 200,
            body: JSON.stringify({
                contact,
                weather: {
                    city: weatherData.name,
                    temperature: weatherData.main.temp,
                    description: weatherData.weather[0].description,
                },
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

