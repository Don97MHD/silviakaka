// pages/api/revalidate.js

export default async function handler(req, res) {
  // 1. تحقق من أن الطلب هو POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. تحقق من المفتاح السري
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 3. تحقق من وجود مسار (path) في جسم الطلب
  const pathToRevalidate = req.body.path;
  if (!pathToRevalidate) {
    return res.status(400).json({ message: 'Path to revalidate is required in the request body' });
  }

  try {
    // 4. أمر Next.js بإعادة بناء الصفحة
    // `unstable_revalidate` هو الاسم المستخدم في الإصدارات القديمة، `revalidate` هو الاسم الحالي.
    await res.revalidate(pathToRevalidate);
    console.log(`Successfully revalidated: ${pathToRevalidate}`);
    return res.json({ revalidated: true, path: pathToRevalidate });
  } catch (err) {
    console.error(`Error revalidating ${pathToRevalidate}:`, err);
    // إذا فشلت العملية، أرسل رسالة خطأ 500
    return res.status(500).send('Error revalidating');
  }
}