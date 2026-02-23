import fs from 'fs';
import path from 'path';

const verifyToken = (req) => req.headers.authorization?.split(' ')[1] === 'fake-secure-token';

export default async function handler(req, res) {
    if (!verifyToken(req)) return res.status(401).json({ message: 'Unauthorized' });

    const { messages, aiApiUrl } = req.body;

    try {
        // لا حاجة لاستيراد 'node-fetch' بعد الآن
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

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Error communicating with Ollama server:", error);
        res.status(500).json({ message: "Failed to generate recipe from your AI server.", details: error.message });
    }
}