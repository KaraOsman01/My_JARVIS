
export default async function handler(req, res) {
    // Ye Vercel ke Environment Variables se key uthayega
    const weatherKey = process.env.WEATHER_API_KEY; 
    const city = "Srinagar"; // Aap isse dynamic bhi bana sakte hain
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Weather fetch failed" });
    }
}
