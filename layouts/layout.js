import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router'; // <-- 1. تم إضافة هذا الاستيراد
import Footer from '../components/Footer';
import PageHeader from '../components/Header';
import config from '../lib/config';
import { Poppins, Sora } from 'next/font/google';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-poppins',
    display: 'swap',
});

const sora = Sora({
    subsets: ['latin'],
    weight: ['300', '600'],
    variable: '--font-sora',
    display: 'swap',
});

const Layout = ({
    children, additionalClass = [], title, description, ogImage, ogType, allRecipesForSearch, categories
}) => {
    const router = useRouter(); // <-- 2. تهيئة الـ Router

    const pageTitle = title || config.siteMetadata.title;
    const pageDescription = description || config.siteMetadata.description;
    
    // 3. إصلاح بناء الرابط الأساسي (Canonical URL)
    // يزيل الشرطة المائلة في النهاية إذا كان المسار هو الصفحة الرئيسية لتجنب التكرار
    const {siteUrl} = config.siteMetadata;
    const currentPath = router.asPath === '/' ? '' : router.asPath;
    const canonicalUrl = `${siteUrl}${currentPath}`.split('?')[0]; // إزالة الـ query params من الرابط الأساسي

    // 4. إصلاح رابط الصورة
    const imageUrl = ogImage
        ? `${siteUrl}${ogImage}`
        : `${siteUrl}/images/recipes/silviakaka-klassisk.jpg`;

    return (
        <main className={[`${poppins.variable} ${sora.variable} font-poppins`, ...additionalClass].join(' ')}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="description" content={pageDescription} />

                {/* Canonical Link - مهم جداً للسيو */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph Tags */}
                <meta property="og:title" content={pageTitle} key="ogtitle" />
                <meta property="og:description" content={pageDescription} key="ogdesc" />
                <meta property="og:site_name" content={config.siteMetadata.title} key="ogsitename" />
                <meta property="og:url" content={canonicalUrl} key="ogurl" />
                <meta property="og:image" content={imageUrl} key="ogimage" />
                <meta property="og:type" content={ogType || 'website'} key="ogtype" />
                
                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" key="twittercard" />
                <meta name="twitter:title" content={pageTitle} key="twittertitle" />
                <meta name="twitter:description" content={pageDescription} key="twitterdesc" />
                <meta name="twitter:image" content={imageUrl} key="twitterimage" />
                
                <link rel="icon" href="/favicon.png" />
            </Head>
            
            <PageHeader allRecipesForSearch={allRecipesForSearch} categories={categories} />
            
            {children}
            
            <Footer categories={categories} />
        </main>
    );
}

export default Layout;