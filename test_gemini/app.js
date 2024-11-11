import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = process.env.API_KEY;

async function generateText(prompt){
    try{
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        const result = await model.generateContent(prompt)
        console.log(result.response.text());
    }catch(error){
        console.log("Error generating content", error);
    }
}

const prompt = `
Provide a structured JSON response based on the following indoor environmental data. Each field should include a status ("Optimal", "Warning", "Critical") and a recommendation if necessary.

Data:
{
  "sensors": {
    "temperature": 23.3,
    "humidity": 18.53,
    "pressure": 85737,
    "altitude": 1404.68,
    "tvoc": 113,
    "eco2": 570,
    "aqi": 2
  },
  "wifi_info": {
    "mac_address": "c0:4e:30:12:04:7c",
    "ip_address": "10.5.141.135",
    "signal_strength": -61
  },
  "arduino_name": "Gym_EMS",
  "status": "Humidity Out of Range",
  "last_update": "2024-10-31T19:01:33.000Z",
  "createdAt": "2024-10-31T19:01:36.112Z",
  "updatedAt": "2024-10-31T19:01:36.112Z"
}`


// const prompt = process.argv[2];
generateText(prompt);
