import fs from 'fs';
import path from 'path';

// Middleware للتحقق من التوكن
const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token === 'fake-secure-token'; // Using the corrected token
};

const pageContentPath = path.join(process.cwd(), 'data', 'pageContent.json');

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const pageContent = JSON.parse(fs.readFileSync(pageContentPath, 'utf8'));
            res.status(200).json(pageContent);
        } catch (error) {
            res.status(500).json({ message: 'Could not read page content file.' });
        }
    } else if (req.method === 'POST') {
        try {
            const { pageKey, newContent } = req.body;
            if (!pageKey || !newContent) {
                return res.status(400).json({ message: 'Page key and new content are required.' });
            }

            const allContent = JSON.parse(fs.readFileSync(pageContentPath, 'utf8'));
            allContent[pageKey] = newContent;

            fs.writeFileSync(pageContentPath, JSON.stringify(allContent, null, 2));
            
            res.status(200).json({ message: `Page '${pageKey}' updated successfully!` });
        } catch (error) {
            res.status(500).json({ message: 'Error updating page content.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
