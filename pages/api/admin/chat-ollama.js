// pages/api/admin/chat-ollama.js

const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token === 'fake-secure-token';
};

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { messages, aiApiUrl } = req.body;

    if (!messages || !aiApiUrl) {
        return res.status(400).json({ message: 'Missing required parameters.' });
    }

    try {
        const response = await fetch(`${aiApiUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messages,
                stream: false,
                format: "json",
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ollama server error: ${response.status} ${errorBody}`);
        }

        // Your Express server already parses the JSON, so we expect a direct JSON object here.
        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Error communicating with Ollama server:", error);
        res.status(500).json({ message: "Failed to process chat request.", details: error.message });
    }
}
