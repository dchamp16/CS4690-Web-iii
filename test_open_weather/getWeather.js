import axios from 'axios'

export async function getData(lon, lat) {
    const api_key = process.env.API_KEY
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`);
        console.log(response.data); // Log only the data portion of the response
    } catch (err) {
        console.error("Error fetching data:", err.response ? err.response.data : err.message);
    }
}

export function testHello(){
    console.log('Hello World!');
}


