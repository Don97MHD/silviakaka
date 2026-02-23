export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
         return res.status(500).json({ message: 'Admin password not set on server.' });
    }

    if (password === adminPassword) {
        // في تطبيق حقيقي، يجب استخدام توكن آمن (JWT)
        const token = 'fake-secure-token'; // توكن بسيط للعرض
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
}