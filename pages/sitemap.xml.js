// pages/sitemap.xml.js

import { getAllRecipes } from '../lib/recipe';
import { getCategories } from '../lib/category'; // <-- 1. استيراد دالة جلب التصنيفات

// عنوان URL الأساسي لموقعك
const SITE_URL = 'https://silviakaka.se';

function generateSiteMap(recipes, categories) { // <-- 2. استقبال التصنيفات
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- 1. static pages -->
     <url>
       <loc>${SITE_URL}</loc>
       <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
       <priority>1.00</priority>
     </url>
     <url>
       <loc>${SITE_URL}/om-oss</loc>
       <lastmod>2024-07-28</lastmod> 
       <priority>0.80</priority>
     </url>
     <url>
       <loc>${SITE_URL}/kontakta-oss</loc>
       <lastmod>2024-07-28</lastmod>
       <priority>0.80</priority>
     </url>
     <url>
       <loc>${SITE_URL}/recept</loc>
       <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
       <priority>0.90</priority>
     </url>

     <!-- 2. category pages -->
     ${categories
       .map(({ slug }) => {
         return `
       <url>
           <loc>${`${SITE_URL}/${slug}`}</loc>
           <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
           <changefreq>monthly</changefreq>
           <priority>0.85</priority>
       </url>
     `;
       })
       .join('')}

     <!-- 3. recipes pages -->
     ${recipes
       .map(({ slug, datePublished }) => {
         return `
       <url>
           <loc>${`${SITE_URL}/recept/${slug}`}</loc>
           <lastmod>${datePublished || new Date().toISOString().split('T')[0]}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.70</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

// هذه دالة خاصة بـ Next.js لتوليد الصفحات من جانب الخادم
export async function getServerSideProps({ res }) {
    // جلب جميع الوصفات وجميع التصنيفات
    const recipesResponse = await getAllRecipes();
    const recipes = recipesResponse.data || [];
    const categories = await getCategories(); // <-- 3. جلب التصنيفات هنا

    // توليد محتوى الـ sitemap
    const sitemap = generateSiteMap(recipes, categories); // <-- 4. تمريرها للدالة

    // إعداد الـ Headers
    res.setHeader('Content-Type', 'text/xml');
    // إرسال محتوى الـ sitemap إلى المتصفح
    res.write(sitemap);
    res.end();

    // إرجاع كائن فارغ لأننا تعاملنا مع الاستجابة يدوياً
    return {
        props: {},
    };
}

// المكون نفسه لا يعرض أي شيء، لأن getServerSideProps تتعامل مع كل شيء
const Sitemap = () => {};

export default Sitemap;