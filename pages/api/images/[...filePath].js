// pages/api/images/[...filePath].js
import fs from 'fs';
import path from 'path';
import mime from 'mime';

export default async function handler(req, res) {
    // 1. استخراج مسار الملف من رابط الطلب
    const filePathParts = req.query.filePath;
    if (!filePathParts || filePathParts.length === 0) {
        return res.status(400).send('File path is required.');
    }

    // 2. بناء المسار المطلق والآمن للملف على السيرفر
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const requestedPath = path.join(uploadsDir, ...filePathParts);

    // 3. **فحص أمني مهم جداً:** التأكد من أن المسار المطلوب لا يخرج عن مجلد 'uploads'
    // هذا يمنع هجمات Path Traversal
    if (!requestedPath.startsWith(uploadsDir)) {
        return res.status(403).send('Forbidden');
    }

    try {
        // 4. التحقق من وجود الملف
        if (fs.existsSync(requestedPath)) {
            // 5. قراءة الملف وتحديد نوعه
            const fileBuffer = fs.readFileSync(requestedPath);
            const contentType = mime.getType(requestedPath) || 'application/octet-stream';
            
            // 6. إرسال الملف إلى المتصفح مع الـ Header الصحيح
            res.setHeader('Content-Type', contentType);
            res.send(fileBuffer);
        } else {
            // إذا لم يتم العثور على الملف، أرسل خطأ 404
            res.status(404).send('File not found.');
        }
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).send('Internal Server Error');
    }
}