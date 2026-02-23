import fs from 'fs';
import path from 'path';

const verifyToken = (req) => req.headers.authorization?.split(' ')[1] === 'fake-secure-token';

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.IMAGEN_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ message: "Imagen API key is not configured." });
    }

    try {
        const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
        const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/imagegeneration:predict`;

        // استخدام fetch المدمجة مباشرة
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Failed to generate image from AI service.');
        }

        const data = await response.json();
        const base64Data = data.predictions[0].bytesBase64Encoded;
        const buffer = Buffer.from(base64Data, 'base64');
        
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'recipes', 'ai-generated');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filename = `ai_${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        const publicPath = `/images/recipes/ai-generated/${filename}`;
        res.status(200).json({ url: publicPath });

    } catch (error) {
        console.error("Image generation error:", error);
        res.status(500).json({ message: 'Failed to generate image.' });
    }
}