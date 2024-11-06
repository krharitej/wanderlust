const axios = require('axios');

const languageCodeMap = require('./iso639-2_639-1map.js')

async function getLocalLanguage(input) {
    let country;

    try {
        const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${input}`);
        country = countryResponse.data[0].name.common;
    } catch (error) {}

    if (!country) {
        try {
            const apiKey = 'AIzaSyCJBKffCSWtH9EyqriePnsXmy7na6FIMc8';
            const cityResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(input)}&key=${apiKey}`
            );

            if (cityResponse.data.results && cityResponse.data.results.length > 0) {
                const placeId = cityResponse.data.results[0].place_id;

                const detailsResponse = await axios.get(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
                );

                if (detailsResponse.data.result && detailsResponse.data.result.address_components) {
                    const addressComponents = detailsResponse.data.result.address_components;
                    const countryComponent = addressComponents.find(component => 
                        component.types.includes("country")
                    );

                    if (countryComponent) {
                        country = countryComponent.long_name;
                    }
                }
            }
        } catch (error) {}
    }

    try {
        const languageResponse = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
        if (languageResponse.data.length > 0) {
            const languages = languageResponse.data[0].languages;
            const languageCodeISO639_2 = Object.keys(languages)[0];
            const languageCode = languageCodeMap[languageCodeISO639_2] || languageCodeISO639_2;
            console.log(languageCode);
            return languageCode;
        }
    } catch (error) {}

    return null;
}
getLocalLanguage("Norway");
getLocalLanguage("France");
