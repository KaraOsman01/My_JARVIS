export default async function handler(req, res) {
    const newsKey = process.env.NEWS_API_KEY;
    
    const url = `https://newsapi.org/v2/top-news?language=en&category=general&apiKey=${newsKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "ok") {
            return res.status(500).json({ error: data.message || "NewsAPI Error" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Network Error" });
    }
}
