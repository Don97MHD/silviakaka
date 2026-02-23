import fs from 'fs';
import path from 'path';

const verifyToken = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return token === 'fake-secure-token';
};

const siteConfigPath = path.join(process.cwd(), 'data', 'siteConfig.json');
const adminConfigPath = path.join(process.cwd(), 'data', 'adminConfig.json');

// Helper function to read a file or create it with default content if it doesn't exist
const readOrCreateFile = (filePath, defaultConfig) => {
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            // Ensure the file is not empty before parsing
            return fileContent ? JSON.parse(fileContent) : defaultConfig;
        } else {
            fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
    } catch (error) {
        console.error(`Error with file at ${filePath}. Rewriting with default. Error: ${error.message}`);
        // If parsing fails or any other error occurs, rewrite with default
        fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
};

export default async function handler(req, res) {
    if (!verifyToken(req)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const siteConfigDefault = { title: "Silviakaka", description: "", siteUrl: "", logo: "", favicon: "", language: "sv" };
            const adminConfigDefault = { password: "your_secret_password_here", aiApiUrl: "" };

            const siteConfig = readOrCreateFile(siteConfigPath, siteConfigDefault);
            const adminConfig = readOrCreateFile(adminConfigPath, adminConfigDefault);

            // Ensure the response always has the aiApiUrl key
            res.status(200).json({ siteConfig, adminConfig: { aiApiUrl: adminConfig.aiApiUrl || "" } });
        } catch (error) {
            res.status(500).json({ message: 'Could not process settings.', details: error.message });
        }
    } else if (req.method === 'POST') {
        try {
            const { siteConfig, newPassword, aiApiUrl } = req.body;
            
            // Read existing or create default configs
            const currentSiteConfig = readOrCreateFile(siteConfigPath, {});
            const currentAdminConfig = readOrCreateFile(adminConfigPath, {});

            // Merge and write updates
            if (siteConfig) {
                fs.writeFileSync(siteConfigPath, JSON.stringify({ ...currentSiteConfig, ...siteConfig }, null, 2));
            }

            const updatedAdminConfig = { ...currentAdminConfig };
            if (newPassword) updatedAdminConfig.password = newPassword;
            if (aiApiUrl !== undefined) updatedAdminConfig.aiApiUrl = aiApiUrl; // Allow setting empty string
            
            fs.writeFileSync(adminConfigPath, JSON.stringify(updatedAdminConfig, null, 2));
            
            res.status(200).json({ message: 'Settings updated successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating settings.', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
