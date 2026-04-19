export default async function handler(req, res) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Safe on backend
    const { fileName, content, commitMessage, sha } = req.body;

    const REPO_OWNER = "KaraOsman01";
    const REPO_NAME = "My_JARVIS";
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: commitMessage,
                content: content, // Frontend se base64 aayega
                sha: sha
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "GitHub API Failed" });
    }
}
