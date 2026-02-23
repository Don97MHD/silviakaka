// pages/api/upload.js (MODIFIED FOR PRODUCTION)
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

//  1. تغيير مسار الرفع إلى مجلد "uploads" خارج "public"
const uploadDir = path.join(process.cwd(), 'uploads', 'recipes');

// التأكد من وجود مجلد الرفع
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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

    const form = formidable({
        uploadDir: uploadDir,
        keepExtensions: true,
        filename: (name, ext, part) => {
            const sanitizedName = part.originalFilename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
            return `${Date.now()}_${sanitizedName}`;
        }
    });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'Error parsing the file upload.' });
        }

        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ error: "No file uploaded. Make sure the form field name is 'file'." });
        }

        // 2. بناء الرابط الجديد الذي يشير إلى API خدمة الصور
        const imageName = path.basename(file.filepath);
        const publicPath = `/api/images/recipes/${imageName}`;
        
        // 3. إرجاع الرابط الجديد
        res.status(200).json({ url: publicPath });
    });
}